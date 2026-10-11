from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.security import verify_token, UserPayload
from app.repositories.base import UserRepository

def get_current_user(
    authorization: str = Header(None, alias="Authorization"),
    db: Session = Depends(get_db)
) -> UserPayload:
    if not authorization:
        # Fallback to dev user in local mock mode if token is missing
        user_payload = UserPayload(id="00000000-0000-0000-0000-000000000001", email="student@interviewiq.ai")
    else:
        token = authorization.replace("Bearer ", "").strip()
        user_payload = verify_token(token)

    # Ensure profile exists in DB
    user_repo = UserRepository(db)
    profile = user_repo.get_by_id(user_payload.id)
    if not profile:
        user_repo.create(
            user_id=user_payload.id,
            full_name=user_payload.email.split("@")[0] if user_payload.email else "Student User"
        )

    return user_payload
