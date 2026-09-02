from typing import Optional
from fastapi import APIRouter, Depends, Request, Response, status, Cookie
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.config import settings
from app.core.rate_limiter import limiter
from app.api.dependencies import get_current_user
from app.services.auth_service import AuthService
from app.models.user import User
from app.schemas.auth import (
    UserRegister, UserLogin, GoogleAuthRequest,
    ForgotPasswordRequest, ResetPasswordRequest, ChangePasswordRequest,
    UserResponse, TokenResponse
)

router = APIRouter()

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit(settings.RATE_LIMIT_REGISTER)
async def register(
    request: Request,
    payload: UserRegister,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    user_agent = request.headers.get("user-agent")
    ip_address = request.client.host if request.client else None
    service = AuthService(db)
    return await service.register(payload, response, user_agent=user_agent, ip_address=ip_address)

@router.post("/login", response_model=TokenResponse)
@limiter.limit(settings.RATE_LIMIT_LOGIN)
async def login(
    request: Request,
    payload: UserLogin,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    user_agent = request.headers.get("user-agent")
    ip_address = request.client.host if request.client else None
    service = AuthService(db)
    return await service.login(payload, response, user_agent=user_agent, ip_address=ip_address)

@router.post("/google", response_model=TokenResponse)
@limiter.limit(settings.RATE_LIMIT_LOGIN)
async def google_login(
    request: Request,
    payload: GoogleAuthRequest,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    user_agent = request.headers.get("user-agent")
    ip_address = request.client.host if request.client else None
    service = AuthService(db)
    return await service.google_login(payload, response, user_agent=user_agent, ip_address=ip_address)

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    request: Request,
    response: Response,
    fintrack_refresh_token: Optional[str] = Cookie(None),
    db: AsyncSession = Depends(get_db)
):
    user_agent = request.headers.get("user-agent")
    ip_address = request.client.host if request.client else None
    # If cookie is not present, check Authorization or body if client sent it explicitly
    raw_token = fintrack_refresh_token
    if not raw_token:
        body = {}
        if request.headers.get("content-type") == "application/json":
            try:
                body = await request.json()
            except Exception:
                body = {}
        raw_token = body.get("refresh_token") if isinstance(body, dict) else None


    service = AuthService(db)
    return await service.refresh_token(raw_token, response, user_agent=user_agent, ip_address=ip_address)

@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout(
    response: Response,
    fintrack_refresh_token: Optional[str] = Cookie(None),
    db: AsyncSession = Depends(get_db)
):
    service = AuthService(db)
    return await service.logout(fintrack_refresh_token, response)

@router.post("/logout-all", status_code=status.HTTP_200_OK)
async def logout_all(
    response: Response,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = AuthService(db)
    return await service.logout_all(current_user.id, response)

@router.post("/forgot-password", status_code=status.HTTP_200_OK)
@limiter.limit(settings.RATE_LIMIT_RESET)
async def forgot_password(
    request: Request,
    payload: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    service = AuthService(db)
    return await service.forgot_password(payload)

@router.post("/reset-password", status_code=status.HTTP_200_OK)
@limiter.limit(settings.RATE_LIMIT_RESET)
async def reset_password(
    request: Request,
    payload: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    service = AuthService(db)
    return await service.reset_password(payload)

@router.post("/change-password", status_code=status.HTTP_200_OK)
async def change_password(
    payload: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = AuthService(db)
    return await service.change_password(current_user.id, payload)

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)
