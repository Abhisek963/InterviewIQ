import os
import uuid
import shutil
from typing import List
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.dependencies import get_current_user
from app.core.security import UserPayload
from app.core.config import settings
from app.repositories.base import ResumeRepository
from app.services.resume_parser import ResumeParserService
from app.schemas.schemas import ResumeRead

router = APIRouter(prefix="/resumes", tags=["Resumes"])

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".doc"}
MAX_FILE_SIZE = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024

@router.post("", response_model=ResumeRead, status_code=status.HTTP_201_CREATED)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: UserPayload = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type '{ext}'. Only PDF and DOCX files are allowed."
        )

    # Read content & validate file size
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File size exceeds maximum allowed limit of {settings.MAX_UPLOAD_SIZE_MB}MB."
        )
    if len(content) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty."
        )

    # Save to disk
    safe_filename = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, safe_filename)
    with open(file_path, "wb") as f:
        f.write(content)

    repo = ResumeRepository(db)
    resume = repo.create(
        user_id=current_user.id,
        file_path=file_path,
        original_filename=file.filename
    )

    try:
        parsed_data = ResumeParserService.parse_file(file_path, file.filename)
        resume = repo.update_parsed_data(
            resume_id=resume.id,
            extracted_text=parsed_data["extracted_text"],
            parsed_profile=parsed_data["parsed_profile"],
            status="ready"
        )
    except Exception as e:
        repo.update_parsed_data(
            resume_id=resume.id,
            extracted_text="",
            parsed_profile=None,
            status="failed",
            error_message=str(e)
        )
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Failed to parse resume: {str(e)}"
        )

    return resume

@router.get("", response_model=List[ResumeRead])
def list_resumes(
    current_user: UserPayload = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    repo = ResumeRepository(db)
    return repo.list_by_user(current_user.id)

@router.get("/{resume_id}", response_model=ResumeRead)
def get_resume(
    resume_id: str,
    current_user: UserPayload = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    repo = ResumeRepository(db)
    resume = repo.get_by_id(resume_id, current_user.id)
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")
    return resume

@router.delete("/{resume_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_resume(
    resume_id: str,
    current_user: UserPayload = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    repo = ResumeRepository(db)
    resume = repo.get_by_id(resume_id, current_user.id)
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")
    
    # Remove file from disk
    if os.path.exists(resume.file_path):
        try:
            os.remove(resume.file_path)
        except Exception:
            pass

    repo.delete(resume_id, current_user.id)
    return None
