from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.dependencies import get_current_user
from app.core.security import UserPayload
from app.repositories.base import ReportRepository, InterviewRepository
from app.models.models import InterviewReport
from app.schemas.schemas import ReportRead

router = APIRouter(prefix="", tags=["Reports"])

@router.get("/interviews/{session_id}/report", response_model=ReportRead)
def get_session_report(
    session_id: str,
    current_user: UserPayload = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify session ownership
    int_repo = InterviewRepository(db)
    session = int_repo.get_session(session_id, current_user.id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    repo = ReportRepository(db)
    report = repo.get_by_session(session_id, current_user.id)
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not ready or session incomplete")
    return report

@router.get("/reports", response_model=List[ReportRead])
def list_reports(
    current_user: UserPayload = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    repo = ReportRepository(db)
    return repo.list_by_user(current_user.id)

@router.get("/reports/{report_id}", response_model=ReportRead)
def get_report_by_id(
    report_id: str,
    current_user: UserPayload = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    report_obj = db.query(InterviewReport).filter(
        InterviewReport.id == report_id,
        InterviewReport.user_id == current_user.id
    ).first()

    if not report_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
    return report_obj
