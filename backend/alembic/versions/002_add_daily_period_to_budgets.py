"""002_add_daily_period_to_budgets

Revision ID: 002_add_daily_period_to_budgets
Revises: 001_initial_schema
Create Date: 2026-08-28 02:15:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '002_add_daily_period_to_budgets'
down_revision: Union[str, None] = '001_initial_schema'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Drop old check_budget_period_monthly constraint and add check_budget_period_valid
    op.drop_constraint('check_budget_period_monthly', 'budgets', type_='check')
    op.create_check_constraint(
        'check_budget_period_valid',
        'budgets',
        "period IN ('monthly', 'daily')"
    )


def downgrade() -> None:
    op.drop_constraint('check_budget_period_valid', 'budgets', type_='check')
    op.create_check_constraint(
        'check_budget_period_monthly',
        'budgets',
        "period = 'monthly'"
    )
