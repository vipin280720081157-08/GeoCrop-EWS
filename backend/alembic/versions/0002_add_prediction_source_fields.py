"""add source and model_version to predictions

Revision ID: 0002
Revises: 0001
Create Date: 2026-08-12
"""
from alembic import op
import sqlalchemy as sa

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("predictions", sa.Column("source", sa.String, nullable=True))
    op.add_column("predictions", sa.Column("model_version", sa.String, nullable=True))


def downgrade():
    op.drop_column("predictions", "model_version")
    op.drop_column("predictions", "source")
