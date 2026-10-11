import pytest
from app.services.evaluator import AnswerEvaluatorService
from app.services.interview_planner import InterviewPlannerService
from app.services.report_generator import ReportGeneratorService
from app.services.resume_parser import ResumeParserService

def test_resume_parser_structuring():
    sample_text = """
    John Doe
    Education: B.Tech Computer Science from State University
    Skills: Python, React, SQL, FastAPI, Docker
    Projects: E-Commerce Platform built with React and Python FastAPI
    Experience: Software Engineer Intern at Tech Corp
    """
    profile = ResumeParserService.structure_resume_text(sample_text)
    assert "Python" in profile["skills"]
    assert "React" in profile["skills"]
    assert len(profile["education"]) > 0
    assert len(profile["projects"]) > 0

def test_answer_evaluator_score_calculation():
    eval_res = AnswerEvaluatorService.evaluate_answer(
        question_text="Explain how indexing improves database performance.",
        category="technical",
        topic="Databases",
        candidate_answer="Indexing creates a B-Tree structure over column values allowing O(log N) lookup time instead of O(N) full table scan."
    )
    assert "score" in eval_res
    assert 0.0 <= eval_res["score"] <= 100.0
    assert "technical_correctness" in eval_res["dimension_scores"]
    assert "relevance" in eval_res["dimension_scores"]
    assert "reasoning_and_depth" in eval_res["dimension_scores"]
    assert "communication_clarity" in eval_res["dimension_scores"]
    assert "answer_structure" in eval_res["dimension_scores"]

def test_interview_planner():
    parsed_resume = {"skills": ["Python", "FastAPI"], "projects": [{"title": "Web App"}]}
    plan = InterviewPlannerService.generate_plan(
        parsed_resume=parsed_resume,
        company_name="Google",
        job_title="Software Engineer",
        interview_type="technical",
        difficulty="intermediate",
        duration_minutes=15
    )
    assert len(plan) == 5
    assert plan[0]["sequence_number"] == 1

def test_report_generator_empty():
    report = ReportGeneratorService.generate_final_report("Google", "SDE", [])
    assert report["overall_score"] == 0.0
