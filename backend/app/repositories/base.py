from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.models import Profile, Resume, InterviewSession, InterviewQuestion, Answer, InterviewReport

class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: str) -> Optional[Profile]:
        return self.db.query(Profile).filter(Profile.id == user_id).first()

    def create(self, user_id: str, full_name: str, college_name: Optional[str] = None, graduation_year: Optional[int] = None) -> Profile:
        profile = Profile(
            id=user_id,
            full_name=full_name,
            college_name=college_name,
            graduation_year=graduation_year
        )
        self.db.add(profile)
        self.db.commit()
        self.db.refresh(profile)
        return profile

    def update(self, user_id: str, full_name: Optional[str] = None, college_name: Optional[str] = None, graduation_year: Optional[int] = None) -> Profile:
        profile = self.get_by_id(user_id)
        if not profile:
            profile = self.create(user_id=user_id, full_name=full_name or "Student User", college_name=college_name, graduation_year=graduation_year)
            return profile
        
        if full_name is not None:
            profile.full_name = full_name
        if college_name is not None:
            profile.college_name = college_name
        if graduation_year is not None:
            profile.graduation_year = graduation_year

        self.db.commit()
        self.db.refresh(profile)
        return profile

class ResumeRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, resume_id: str, user_id: str) -> Optional[Resume]:
        return self.db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == user_id).first()

    def list_by_user(self, user_id: str) -> List[Resume]:
        return self.db.query(Resume).filter(Resume.user_id == user_id).order_by(desc(Resume.created_at)).all()

    def create(self, user_id: str, file_path: str, original_filename: str, file_hash: Optional[str] = None) -> Resume:
        resume = Resume(
            user_id=user_id,
            file_path=file_path,
            original_filename=original_filename,
            file_hash=file_hash,
            status="uploaded"
        )
        self.db.add(resume)
        self.db.commit()
        self.db.refresh(resume)
        return resume

    def update_parsed_data(self, resume_id: str, extracted_text: str, parsed_profile: dict, status: str = "ready", error_message: Optional[str] = None) -> Resume:
        resume = self.db.query(Resume).filter(Resume.id == resume_id).first()
        if resume:
            resume.extracted_text = extracted_text
            resume.parsed_profile = parsed_profile
            resume.status = status
            resume.error_message = error_message
            self.db.commit()
            self.db.refresh(resume)
        return resume

    def delete(self, resume_id: str, user_id: str) -> bool:
        resume = self.get_by_id(resume_id, user_id)
        if resume:
            self.db.delete(resume)
            self.db.commit()
            return True
        return False

class InterviewRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_session(self, session_id: str, user_id: str) -> Optional[InterviewSession]:
        return self.db.query(InterviewSession).filter(
            InterviewSession.id == session_id,
            InterviewSession.user_id == user_id
        ).first()

    def list_sessions(self, user_id: str) -> List[InterviewSession]:
        return self.db.query(InterviewSession).filter(
            InterviewSession.user_id == user_id
        ).order_by(desc(InterviewSession.created_at)).all()

    def create_session(self, user_id: str, resume_id: str, company_name: str, job_title: str, interview_type: str, difficulty: str, duration_minutes: int, question_plan: dict) -> InterviewSession:
        session = InterviewSession(
            user_id=user_id,
            resume_id=resume_id,
            company_name=company_name,
            job_title=job_title,
            interview_type=interview_type,
            difficulty=difficulty,
            duration_minutes=duration_minutes,
            question_plan=question_plan,
            status="created",
            current_question_index=0
        )
        self.db.add(session)
        self.db.commit()
        self.db.refresh(session)
        return session

    def add_question(self, session_id: str, sequence_number: int, question_text: str, category: str, topic: str, difficulty: str, evaluation_rubric: dict, parent_question_id: Optional[str] = None) -> InterviewQuestion:
        # Check if sequence number already exists for session to avoid duplicates
        existing = self.db.query(InterviewQuestion).filter(
            InterviewQuestion.session_id == session_id,
            InterviewQuestion.sequence_number == sequence_number
        ).first()
        if existing:
            return existing

        question = InterviewQuestion(
            session_id=session_id,
            sequence_number=sequence_number,
            question_text=question_text,
            category=category,
            topic=topic,
            difficulty=difficulty,
            evaluation_rubric=evaluation_rubric,
            parent_question_id=parent_question_id
        )
        self.db.add(question)
        self.db.commit()
        self.db.refresh(question)
        return question

    def get_question_by_sequence(self, session_id: str, sequence_number: int) -> Optional[InterviewQuestion]:
        return self.db.query(InterviewQuestion).filter(
            InterviewQuestion.session_id == session_id,
            InterviewQuestion.sequence_number == sequence_number
        ).first()

    def get_current_question(self, session_id: str) -> Optional[InterviewQuestion]:
        session = self.db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
        if not session:
            return None
        return self.get_question_by_sequence(session_id, session.current_question_index + 1)

    def add_answer(self, question_id: str, user_id: str, answer_text: str, score: Optional[float], dimension_scores: Optional[dict], feedback: Optional[dict], response_time_seconds: Optional[int]) -> Answer:
        # Check existing answer for idempotency
        existing = self.db.query(Answer).filter(
            Answer.question_id == question_id,
            Answer.user_id == user_id
        ).first()
        if existing:
            return existing

        answer = Answer(
            question_id=question_id,
            user_id=user_id,
            answer_text=answer_text,
            score=score,
            dimension_scores=dimension_scores,
            feedback=feedback,
            response_time_seconds=response_time_seconds
        )
        self.db.add(answer)
        self.db.commit()
        self.db.refresh(answer)
        return answer

    def get_session_questions_and_answers(self, session_id: str):
        questions = self.db.query(InterviewQuestion).filter(
            InterviewQuestion.session_id == session_id
        ).order_by(InterviewQuestion.sequence_number).all()
        
        result = []
        for q in questions:
            ans = self.db.query(Answer).filter(Answer.question_id == q.id).first()
            result.append((q, ans))
        return result

    def update_session_status(self, session_id: str, status: str, current_index: Optional[int] = None) -> InterviewSession:
        session = self.db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
        if session:
            session.status = status
            if current_index is not None:
                session.current_question_index = current_index
            self.db.commit()
            self.db.refresh(session)
        return session

class ReportRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_session(self, session_id: str, user_id: str) -> Optional[InterviewReport]:
        return self.db.query(InterviewReport).filter(
            InterviewReport.session_id == session_id,
            InterviewReport.user_id == user_id
        ).first()

    def list_by_user(self, user_id: str) -> List[InterviewReport]:
        return self.db.query(InterviewReport).filter(
            InterviewReport.user_id == user_id
        ).order_by(desc(InterviewReport.created_at)).all()

    def create_or_update(self, session_id: str, user_id: str, overall_score: float, dimension_scores: dict, strengths: list, improvements: list, answer_reviews: list, practice_plan: list, summary: str, status: str = "ready") -> InterviewReport:
        report = self.db.query(InterviewReport).filter(
            InterviewReport.session_id == session_id
        ).first()

        if not report:
            report = InterviewReport(
                session_id=session_id,
                user_id=user_id,
                overall_score=overall_score,
                dimension_scores=dimension_scores,
                strengths=strengths,
                improvements=improvements,
                answer_reviews=answer_reviews,
                practice_plan=practice_plan,
                summary=summary,
                status=status
            )
            self.db.add(report)
        else:
            report.overall_score = overall_score
            report.dimension_scores = dimension_scores
            report.strengths = strengths
            report.improvements = improvements
            report.answer_reviews = answer_reviews
            report.practice_plan = practice_plan
            report.summary = summary
            report.status = status

        self.db.commit()
        self.db.refresh(report)
        return report
