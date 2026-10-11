import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Integer, Float, DateTime, ForeignKey, Text, JSON, Enum as SQLEnum, UniqueConstraint
)
from sqlalchemy.orm import relationship
from app.db.session import Base

def generate_uuid():
    return str(uuid.uuid4())

def utc_now():
    return datetime.now(timezone.utc)

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    full_name = Column(String(255), nullable=False)
    college_name = Column(String(255), nullable=True)
    graduation_year = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    interview_sessions = relationship("InterviewSession", back_populates="user", cascade="all, delete-orphan")

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("profiles.id"), nullable=False, index=True)
    file_path = Column(String(512), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_hash = Column(String(64), nullable=True)
    extracted_text = Column(Text, nullable=True)
    parsed_profile = Column(JSON, nullable=True)  # skills, education, projects, experience, summary
    status = Column(String(32), default="uploaded", nullable=False)  # uploaded, processing, ready, failed
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    user = relationship("Profile", back_populates="resumes")
    interview_sessions = relationship("InterviewSession", back_populates="resume")

class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("profiles.id"), nullable=False, index=True)
    resume_id = Column(String(36), ForeignKey("resumes.id"), nullable=False, index=True)
    company_name = Column(String(255), nullable=False)
    job_title = Column(String(255), nullable=False)
    interview_type = Column(String(64), nullable=False)  # HR, technical, behavioral, mixed
    difficulty = Column(String(32), nullable=False)  # beginner, intermediate, advanced
    duration_minutes = Column(Integer, nullable=False)  # 10, 20, 30
    question_plan = Column(JSON, nullable=True)  # List of planned questions/topics
    status = Column(String(32), default="created", nullable=False)  # created, in_progress, completed, abandoned
    current_question_index = Column(Integer, default=0, nullable=False)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    user = relationship("Profile", back_populates="interview_sessions")
    resume = relationship("Resume", back_populates="interview_sessions")
    questions = relationship("InterviewQuestion", back_populates="session", cascade="all, delete-orphan", order_by="InterviewQuestion.sequence_number")
    report = relationship("InterviewReport", back_populates="session", uselist=False, cascade="all, delete-orphan")

class InterviewQuestion(Base):
    __tablename__ = "interview_questions"
    __table_args__ = (
        UniqueConstraint('session_id', 'sequence_number', name='uix_session_sequence'),
    )

    id = Column(String(36), primary_key=True, default=generate_uuid)
    session_id = Column(String(36), ForeignKey("interview_sessions.id"), nullable=False, index=True)
    sequence_number = Column(Integer, nullable=False)
    question_text = Column(Text, nullable=False)
    category = Column(String(64), nullable=False)  # technical, behavioral, project, hr
    topic = Column(String(128), nullable=False)
    difficulty = Column(String(32), nullable=False)
    evaluation_rubric = Column(JSON, nullable=True)
    parent_question_id = Column(String(36), ForeignKey("interview_questions.id"), nullable=True)
    created_at = Column(DateTime, default=utc_now)

    session = relationship("InterviewSession", back_populates="questions")
    answers = relationship("Answer", back_populates="question", cascade="all, delete-orphan")

class Answer(Base):
    __tablename__ = "answers"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    question_id = Column(String(36), ForeignKey("interview_questions.id"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("profiles.id"), nullable=False, index=True)
    answer_text = Column(Text, nullable=False)
    score = Column(Float, nullable=True)  # 0.0 to 100.0
    dimension_scores = Column(JSON, nullable=True)
    feedback = Column(JSON, nullable=True)
    response_time_seconds = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    question = relationship("InterviewQuestion", back_populates="answers")

class InterviewReport(Base):
    __tablename__ = "interview_reports"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    session_id = Column(String(36), ForeignKey("interview_sessions.id"), nullable=False, unique=True, index=True)
    user_id = Column(String(36), ForeignKey("profiles.id"), nullable=False, index=True)
    overall_score = Column(Float, nullable=True)
    dimension_scores = Column(JSON, nullable=True)
    strengths = Column(JSON, nullable=True)
    improvements = Column(JSON, nullable=True)
    answer_reviews = Column(JSON, nullable=True)
    practice_plan = Column(JSON, nullable=True)
    summary = Column(Text, nullable=True)
    status = Column(String(32), default="pending", nullable=False)  # pending, generating, ready, failed
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    session = relationship("InterviewSession", back_populates="report")
