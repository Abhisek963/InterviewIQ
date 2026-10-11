from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict

# Profile Schemas
class ProfileBase(BaseModel):
    full_name: str
    college_name: Optional[str] = None
    graduation_year: Optional[int] = None

class ProfileCreate(ProfileBase):
    id: str

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    college_name: Optional[str] = None
    graduation_year: Optional[int] = None

class ProfileRead(ProfileBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Resume Schemas
class ProjectItem(BaseModel):
    title: str
    description: str
    technologies: List[str] = []

class ExperienceItem(BaseModel):
    role: str
    company: str
    duration: Optional[str] = None
    description: Optional[str] = None

class EducationItem(BaseModel):
    degree: str
    institution: str
    year: Optional[str] = None
    gpa: Optional[str] = None

class ParsedProfile(BaseModel):
    skills: List[str] = []
    education: List[EducationItem] = []
    projects: List[ProjectItem] = []
    internships: List[ExperienceItem] = []
    certifications: List[str] = []
    summary: str = ""

class ResumeRead(BaseModel):
    id: str
    user_id: str
    original_filename: str
    status: str
    parsed_profile: Optional[ParsedProfile] = None
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Interview Schemas
class InterviewCreate(BaseModel):
    resume_id: str
    company_name: str = Field(..., min_length=1, max_length=255)
    job_title: str = Field(..., min_length=1, max_length=255)
    interview_type: str = Field(..., pattern="^(HR|technical|behavioral|mixed)$")
    difficulty: str = Field(..., pattern="^(beginner|intermediate|advanced)$")
    duration_minutes: int = Field(..., ge=10, le=60)

class PlannedQuestion(BaseModel):
    topic: str
    category: str
    objective: str
    difficulty: str
    rubric: Dict[str, Any] = {}

class QuestionRead(BaseModel):
    id: str
    session_id: str
    sequence_number: int
    question_text: str
    category: str
    topic: str
    difficulty: str
    parent_question_id: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class AnswerCreate(BaseModel):
    answer_text: str = Field(..., min_length=1)
    response_time_seconds: Optional[int] = None
    client_submission_id: Optional[str] = None

class DimensionScores(BaseModel):
    technical_correctness: float = 0.0
    relevance: float = 0.0
    reasoning_and_depth: float = 0.0
    communication_clarity: float = 0.0
    answer_structure: float = 0.0

class AnswerFeedback(BaseModel):
    score: float
    dimension_scores: DimensionScores
    correct_concepts: List[str] = []
    missing_concepts: List[str] = []
    factual_errors: List[str] = []
    strengths: List[str] = []
    improvements: List[str] = []
    example_stronger_answer: Optional[str] = None
    confidence_level: float = 1.0
    evaluation_notes: Optional[str] = None

class AnswerRead(BaseModel):
    id: str
    question_id: str
    user_id: str
    answer_text: str
    score: Optional[float] = None
    dimension_scores: Optional[Dict[str, float]] = None
    feedback: Optional[Dict[str, Any]] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class InterviewSessionRead(BaseModel):
    id: str
    user_id: str
    resume_id: str
    company_name: str
    job_title: str
    interview_type: str
    difficulty: str
    duration_minutes: int
    status: str
    current_question_index: int
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    total_planned_questions: int = 5

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    @classmethod
    def model_validate(cls, obj, **kwargs):
        data = super().model_validate(obj, **kwargs)
        # Compute total_planned_questions from question_plan if available
        if hasattr(obj, 'question_plan') and isinstance(obj.question_plan, list):
            data.total_planned_questions = len(obj.question_plan) if obj.question_plan else 5
        return data


# Report Schemas
class PracticeDayPlan(BaseModel):
    day: int
    focus_area: str
    tasks: List[str]
    resource_recommendations: List[str]

class QuestionAnswerReview(BaseModel):
    sequence_number: int
    question_text: str
    user_answer: str
    score: float
    dimension_scores: Dict[str, float]
    feedback_summary: str
    example_stronger_answer: Optional[str] = None

class ReportRead(BaseModel):
    id: str
    session_id: str
    user_id: str
    overall_score: Optional[float] = None
    dimension_scores: Optional[Dict[str, float]] = None
    strengths: List[str] = []
    improvements: List[str] = []
    answer_reviews: List[QuestionAnswerReview] = []
    practice_plan: List[PracticeDayPlan] = []
    summary: Optional[str] = None
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
