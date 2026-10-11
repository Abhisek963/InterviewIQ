import jwt
from typing import Optional, Dict, Any
from pydantic import BaseModel
from app.core.config import settings
from app.core.exceptions import UnauthorizedException

class UserPayload(BaseModel):
    id: str
    email: Optional[str] = None
    role: str = "authenticated"

def verify_token(token: str) -> UserPayload:
    """
    Verifies Supabase JWT token or dev Bearer token.
    Decodes sub (user_id), email, etc.
    In local dev / mock mode, if token matches 'demo-user-token' or Supabase secret isn't configured,
    fallback gracefully to a deterministic dev user.
    """
    if not token:
        raise UnauthorizedException("Missing authentication token")
    
    # Dev / Demo token fallback for instant local testing without external Supabase config
    if token.startswith("dev-token-") or token == "demo-user-token":
        user_id = token.replace("dev-token-", "") if token.startswith("dev-token-") else "00000000-0000-0000-0000-000000000001"
        return UserPayload(id=user_id, email=f"dev-{user_id[:8]}@interviewiq.ai")
        
    try:
        # Decode Supabase JWT token
        # Supabase uses HS256 algorithm with SUPABASE_JWT_SECRET
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            options={"verify_aud": False}
        )
        user_id = payload.get("sub")
        email = payload.get("email")
        if not user_id:
            raise UnauthorizedException("Invalid token payload: missing sub")
        return UserPayload(id=user_id, email=email)
    except jwt.PyJWTError as e:
        # Fallback for unverified JWT in dev mode if secret is default
        if settings.SUPABASE_JWT_SECRET == "dev-secret-key-change-in-production-1234567890":
            try:
                # Unverified decode for smooth local development setup
                payload = jwt.decode(token, options={"verify_signature": False})
                user_id = payload.get("sub", "00000000-0000-0000-0000-000000000001")
                email = payload.get("email", "student@interviewiq.ai")
                return UserPayload(id=user_id, email=email)
            except Exception:
                pass
        raise UnauthorizedException(f"Token validation failed: {str(e)}")
