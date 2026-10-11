from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.dependencies import get_current_user
from app.core.security import UserPayload
from app.repositories.base import UserRepository
from app.schemas.schemas import ProfileRead, ProfileUpdate

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me", response_model=ProfileRead)
def get_current_user_profile(
    current_user: UserPayload = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    repo = UserRepository(db)
    profile = repo.get_by_id(current_user.id)
    if not profile:
        profile = repo.create(user_id=current_user.id, full_name="Student User")
    return profile

@router.patch("/me", response_model=ProfileRead)
def update_user_profile(
    data: ProfileUpdate,
    current_user: UserPayload = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    repo = UserRepository(db)
    return repo.update(
        user_id=current_user.id,
        full_name=data.full_name,
        college_name=data.college_name,
        graduation_year=data.graduation_year
    )
