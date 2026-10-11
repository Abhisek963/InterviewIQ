from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.session import engine, Base
from app.models import Base as ModelsBase
from app.api.v1 import api_v1_router

logger = logging.getLogger("interviewiq")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-create tables for development/production
    try:
        ModelsBase.metadata.create_all(bind=engine)
    except Exception as e:
        logger.warning(f"Could not auto-create database tables on startup (DB may be offline): {e}")
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(api_v1_router, prefix=settings.API_V1_STR)

@app.get("/api/v1/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "mock_ai_mode": settings.MOCK_AI_MODE or not bool(settings.LLM_API_KEY)
    }
