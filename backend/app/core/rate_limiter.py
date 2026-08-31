from slowapi import Limiter
from slowapi.util import get_remote_address
from app.core.config import settings

limiter = Limiter(
    key_func=get_remote_address,
    enabled=settings.ENVIRONMENT.lower() != "testing",
    default_limits=["200/day", "50/hour"]
)
