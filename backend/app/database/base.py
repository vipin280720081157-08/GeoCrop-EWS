"""
Declarative base shared by all ORM models, plus a helper to create tables.
Alembic migrations are the source of truth in production; `init_db` is a
convenience for first-run local development.
"""
from sqlalchemy.orm import declarative_base

Base = declarative_base()


def init_db() -> None:
    """Create all tables directly from the models (used for local quick-start)."""
    from app.database.session import engine
    import app.models  # noqa: F401  (ensures models are registered on Base)

    Base.metadata.create_all(bind=engine)
