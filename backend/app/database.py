from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
from .config import DATABASE_URL
from .models import Base

# Create database engine
# Use StaticPool for SQLite, NullPool for PostgreSQL
engine_kwargs = {}
if "sqlite" in DATABASE_URL:
    engine_kwargs["poolclass"] = StaticPool
    engine_kwargs["connect_args"] = {"check_same_thread": False}
# PostgreSQL uses default connection pooling (NullPool not needed)

engine = create_engine(
    DATABASE_URL,
    echo=False,
    **engine_kwargs
)

# Create session maker
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create all tables
def init_db():
    """Initialize database and create all tables"""
    Base.metadata.create_all(bind=engine)

# Dependency for FastAPI
def get_db():
    """Get database session for dependency injection"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
