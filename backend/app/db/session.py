import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

logger = logging.getLogger("interviewiq.db")

connect_args = {}
db_url = settings.DATABASE_URL

if db_url.startswith("postgresql://"):
    db_url = db_url.replace("postgresql://", "postgresql+psycopg2://", 1)

if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
    engine = create_engine(db_url, connect_args=connect_args, pool_pre_ping=True)
else:
    try:
        # Check if remote Postgres connection can be established within 3 seconds
        test_engine = create_engine(db_url, connect_args={"connect_timeout": 3}, pool_pre_ping=True)
        with test_engine.connect():
            pass
        engine = test_engine
    except Exception as e:
        logger.warning(
            f"Remote database connection failed ({e}). Falling back to local SQLite './interviewiq.db'."
        )
        engine = create_engine("sqlite:///./interviewiq.db", connect_args={"check_same_thread": False}, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
