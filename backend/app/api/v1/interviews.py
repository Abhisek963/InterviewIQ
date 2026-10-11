from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.dependencies import get_current_user
from app.core.security import UserPayload
from app.repositories.base import InterviewRepository, ResumeRepository, ReportRepository
from app.services.interview_planner import InterviewPlannerService
from app.services.interviewer import InterviewerService
from app.services.evaluator import AnswerEvaluatorService
from app.services.report_generator import ReportGeneratorService
from app.schemas.schemas import (
    InterviewCreate, InterviewSessionRead, QuestionRead, AnswerCreate, AnswerRead, AnswerFeedback
)

router = APIRouter(prefix="/interviews", tags=["Interviews"])

@router.post("", response_model=InterviewSessionRead, status_code=status.HTTP_201_CREATED)
def create_interview(
    data: InterviewCreate,
    current_user: UserPayload = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume_repo = ResumeRepository(db)
    resume = resume_repo.get_by_id(data.resume_id, current_user.id)
    if not resume or resume.status != "ready":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Valid ready resume is required to create an interview session."
        )

    parsed_profile = resume.parsed_profile or {}
    question_plan = InterviewPlannerService.generate_plan(
        parsed_resume=parsed_profile,
        company_name=data.company_name,
        job_title=data.job_title,
        interview_type=data.interview_type,
        difficulty=data.difficulty,
        duration_minutes=data.duration_minutes
    )

    interview_repo = InterviewRepository(db)
    session = interview_repo.create_session(
        user_id=current_user.id,
        resume_id=data.resume_id,
        company_name=data.company_name,
        job_title=data.job_title,
        interview_type=data.interview_type,
        difficulty=data.difficulty,
        duration_minutes=data.duration_minutes,
        question_plan=question_plan
    )

    return session

@router.get("", response_model=List[InterviewSessionRead])
def list_interviews(
    current_user: UserPayload = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    repo = InterviewRepository(db)
    return repo.list_sessions(current_user.id)

@router.get("/{session_id}", response_model=InterviewSessionRead)
def get_interview(
    session_id: str,
    current_user: UserPayload = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    repo = InterviewRepository(db)
    session = repo.get_session(session_id, current_user.id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview session not found")
    return session

@router.post("/{session_id}/start", response_model=QuestionRead)
def start_interview(
    session_id: str,
    current_user: UserPayload = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    repo = InterviewRepository(db)
    session = repo.get_session(session_id, current_user.id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    if session.status == "completed":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Session is already completed")

    if session.status == "created":
        session.status = "in_progress"
        session.started_at = datetime.now(timezone.utc)
        db.commit()

    # Generate / Fetch 1st question
    question = repo.get_question_by_sequence(session_id, 1)
    if not question:
        plan = session.question_plan or []
        first_plan = plan[0] if plan else {"topic": "General Technical CS", "category": session.interview_type, "difficulty": session.difficulty}
        
        resume_repo = ResumeRepository(db)
        resume = resume_repo.get_by_id(session.resume_id, current_user.id)
        parsed_profile = resume.parsed_profile if resume else {}

        q_data = InterviewerService.generate_next_question(
            company_name=session.company_name,
            job_title=session.job_title,
            interview_type=session.interview_type,
            difficulty=session.difficulty,
            current_sequence=1,
            planned_item=first_plan,
            parsed_resume=parsed_profile
        )

        question = repo.add_question(
            session_id=session_id,
            sequence_number=1,
            question_text=q_data["question_text"],
            category=q_data["category"],
            topic=q_data["topic"],
            difficulty=q_data["difficulty"],
            evaluation_rubric=q_data["rubric"]
        )

    return question

@router.get("/{session_id}/questions/current", response_model=QuestionRead)
def get_current_question(
    session_id: str,
    current_user: UserPayload = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    repo = InterviewRepository(db)
    session = repo.get_session(session_id, current_user.id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    target_seq = session.current_question_index + 1
    question = repo.get_question_by_sequence(session_id, target_seq)
    if not question:
        plan = session.question_plan or []
        plan_item = plan[target_seq - 1] if target_seq <= len(plan) else {"topic": "Core Engineering", "category": session.interview_type, "difficulty": session.difficulty}

        resume_repo = ResumeRepository(db)
        resume = resume_repo.get_by_id(session.resume_id, current_user.id)
        parsed_profile = resume.parsed_profile if resume else {}

        q_data = InterviewerService.generate_next_question(
            company_name=session.company_name,
            job_title=session.job_title,
            interview_type=session.interview_type,
            difficulty=session.difficulty,
            current_sequence=target_seq,
            planned_item=plan_item,
            parsed_resume=parsed_profile
        )

        question = repo.add_question(
            session_id=session_id,
            sequence_number=target_seq,
            question_text=q_data["question_text"],
            category=q_data["category"],
            topic=q_data["topic"],
            difficulty=q_data["difficulty"],
            evaluation_rubric=q_data["rubric"]
        )

    return question

@router.post("/{session_id}/answers")
def submit_answer(
    session_id: str,
    data: AnswerCreate,
    current_user: UserPayload = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    repo = InterviewRepository(db)
    session = repo.get_session(session_id, current_user.id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    if session.status == "completed":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Interview is already completed. No more answers allowed.")

    current_seq = session.current_question_index + 1
    question = repo.get_question_by_sequence(session_id, current_seq)
    if not question:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No active question found for this sequence.")

    # Check for existing answer (idempotency against network retries)
    from app.models.models import Answer
    existing_answer = db.query(Answer).filter(
        Answer.question_id == question.id,
        Answer.user_id == current_user.id
    ).first()
    if existing_answer:
        # Return idempotent response using existing answer
        return {
            "answer_id": existing_answer.id,
            "status": session.status,
            "is_final": session.status == "completed",
            "evaluation": {
                "score": existing_answer.score,
                "dimension_scores": existing_answer.dimension_scores,
                "feedback": existing_answer.feedback
            }
        }

    # Evaluate answer
    eval_result = AnswerEvaluatorService.evaluate_answer(
        question_text=question.question_text,
        category=question.category,
        topic=question.topic,
        candidate_answer=data.answer_text,
        rubric=question.evaluation_rubric
    )

    answer = repo.add_answer(
        question_id=question.id,
        user_id=current_user.id,
        answer_text=data.answer_text,
        score=eval_result["score"],
        dimension_scores=eval_result["dimension_scores"],
        feedback=eval_result["feedback"],
        response_time_seconds=data.response_time_seconds
    )

    # Advance current_question_index
    plan = session.question_plan or []
    total_planned = len(plan) if plan else 5

    next_seq = current_seq + 1
    if next_seq > total_planned:
        # Reached end of questions -> Complete interview & trigger report
        session.status = "completed"
        session.completed_at = datetime.now(timezone.utc)
        db.commit()

        # Generate final report
        qa_pairs = repo.get_session_questions_and_answers(session_id)
        report_data = ReportGeneratorService.generate_final_report(
            company_name=session.company_name,
            job_title=session.job_title,
            qa_pairs=qa_pairs
        )
        report_repo = ReportRepository(db)
        report_repo.create_or_update(
            session_id=session_id,
            user_id=current_user.id,
            overall_score=report_data["overall_score"],
            dimension_scores=report_data["dimension_scores"],
            strengths=report_data["strengths"],
            improvements=report_data["improvements"],
            answer_reviews=report_data["answer_reviews"],
            practice_plan=report_data["practice_plan"],
            summary=report_data["summary"],
            status="ready"
        )

        return {
            "answer_id": answer.id,
            "status": "completed",
            "is_final": True,
            "evaluation": eval_result
        }
    else:
        session.current_question_index = current_seq
        db.commit()
        return {
            "answer_id": answer.id,
            "status": "in_progress",
            "is_final": False,
            "next_sequence_number": next_seq,
            "evaluation": eval_result
        }

@router.post("/{session_id}/finish", response_model=InterviewSessionRead)
def finish_interview(
    session_id: str,
    current_user: UserPayload = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    repo = InterviewRepository(db)
    session = repo.get_session(session_id, current_user.id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    session.status = "completed"
    session.completed_at = datetime.now(timezone.utc)
    db.commit()

    # Generate final report for answered questions
    qa_pairs = repo.get_session_questions_and_answers(session_id)
    report_data = ReportGeneratorService.generate_final_report(
        company_name=session.company_name,
        job_title=session.job_title,
        qa_pairs=qa_pairs
    )
    report_repo = ReportRepository(db)
    report_repo.create_or_update(
        session_id=session_id,
        user_id=current_user.id,
        overall_score=report_data["overall_score"],
        dimension_scores=report_data["dimension_scores"],
        strengths=report_data["strengths"],
        improvements=report_data["improvements"],
        answer_reviews=report_data["answer_reviews"],
        practice_plan=report_data["practice_plan"],
        summary=report_data["summary"],
        status="ready"
    )

    return session
