from fastapi import APIRouter
from app.api.v1.users import router as users_router
from app.api.v1.resumes import router as resumes_router
from app.api.v1.interviews import router as interviews_router
from app.api.v1.reports import router as reports_router

api_v1_router = APIRouter()
api_v1_router.include_router(users_router)
api_v1_router.include_router(resumes_router)
api_v1_router.include_router(interviews_router)
api_v1_router.include_router(reports_router)
