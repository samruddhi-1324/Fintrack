from fastapi import APIRouter
from app.api.v1.endpoints import (
    health,
    auth,
    categories,
    expenses,
    budgets,
    dashboard,
    reports,
    export,
    ai
)

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(categories.router, prefix="/categories", tags=["Categories"])
api_router.include_router(expenses.router, prefix="/expenses", tags=["Expenses"])
api_router.include_router(budgets.router, prefix="/budgets", tags=["Budgets"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(reports.router, prefix="/reports", tags=["Reports"])
api_router.include_router(export.router, prefix="/export", tags=["Export"])
api_router.include_router(ai.router, prefix="/ai", tags=["AI Recommendations"])


