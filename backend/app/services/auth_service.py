import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional, Tuple
from fastapi import HTTPException, status, Response
from sqlalchemy.ext.asyncio import AsyncSession
import httpx
from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as google_requests

from app.repositories.auth_repository import AuthRepository
from app.repositories.category_repository import CategoryRepository
from app.schemas.auth import (
    UserRegister, UserLogin, GoogleAuthRequest,
    ForgotPasswordRequest, ResetPasswordRequest, ChangePasswordRequest,
    UserResponse, TokenResponse
)
from app.schemas.category import CategoryCreate
from app.core.config import settings
from app.core.security import (
    hash_password, verify_password, validate_password_strength,
    create_access_token, generate_raw_refresh_token, hash_token
)
from app.services.email_service import EmailService


DEFAULT_STARTER_CATEGORIES = [
    "Food & Dining",
    "Transportation",
    "Utilities",
    "Entertainment",
    "Housing",
    "Miscellaneous"
]

class AuthService:
    def __init__(self, db: AsyncSession):
        self.auth_repo = AuthRepository(db)
        self.category_repo = CategoryRepository(db)

    async def _seed_default_categories(self, user_id: uuid.UUID):
        for cat_name in DEFAULT_STARTER_CATEGORIES:
            existing = await self.category_repo.get_by_name(cat_name, user_id=user_id)
            if not existing:
                await self.category_repo.create(
                    CategoryCreate(name=cat_name, is_default=True),
                    user_id=user_id
                )

    def _set_refresh_cookie(self, response: Response, raw_refresh_token: str):
        expires_seconds = settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400
        response.set_cookie(
            key="fintrack_refresh_token",
            value=raw_refresh_token,
            httponly=True,
            secure=settings.COOKIE_SECURE,
            samesite=settings.COOKIE_SAMESITE,
            max_age=expires_seconds,
            path="/api/v1/auth",
            domain=settings.COOKIE_DOMAIN if settings.COOKIE_DOMAIN else None
        )

    def _clear_refresh_cookie(self, response: Response):
        response.delete_cookie(
            key="fintrack_refresh_token",
            path="/api/v1/auth",
            domain=settings.COOKIE_DOMAIN if settings.COOKIE_DOMAIN else None
        )

    async def register(
        self,
        payload: UserRegister,
        response: Response,
        user_agent: Optional[str] = None,
        ip_address: Optional[str] = None
    ) -> TokenResponse:
        # Check password strength
        is_valid, msg = validate_password_strength(payload.password)
        if not is_valid:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=msg)

        # Check existing email
        existing_user = await self.auth_repo.get_user_by_email(payload.email)
        if existing_user:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

        hashed_pw = hash_password(payload.password)
        user = await self.auth_repo.create_user(
            email=payload.email,
            hashed_password=hashed_pw,
            full_name=payload.full_name,
            is_verified=False
        )

        # Seed default starter categories
        await self._seed_default_categories(user.id)

        # Dispatch welcome email asynchronously via EmailService
        await EmailService.send_welcome_email(
            to_email=user.email,
            full_name=user.full_name
        )

        # Issue Access Token & Refresh Token
        access_token = create_access_token({"sub": str(user.id)})
        raw_refresh = generate_raw_refresh_token()
        refresh_hash = hash_token(raw_refresh)
        expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

        await self.auth_repo.create_refresh_token(
            user_id=user.id,
            token_hash=refresh_hash,
            expires_at=expires_at,
            user_agent=user_agent,
            ip_address=ip_address
        )

        self._set_refresh_cookie(response, raw_refresh)

        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=UserResponse.model_validate(user)
        )

    async def login(
        self,
        payload: UserLogin,
        response: Response,
        user_agent: Optional[str] = None,
        ip_address: Optional[str] = None
    ) -> TokenResponse:
        user = await self.auth_repo.get_user_by_email(payload.email)
        if not user or not user.hashed_password:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

        if not verify_password(payload.password, user.hashed_password):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

        if not user.is_active:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is disabled")

        access_token = create_access_token({"sub": str(user.id)})
        raw_refresh = generate_raw_refresh_token()
        refresh_hash = hash_token(raw_refresh)
        expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

        await self.auth_repo.create_refresh_token(
            user_id=user.id,
            token_hash=refresh_hash,
            expires_at=expires_at,
            user_agent=user_agent,
            ip_address=ip_address
        )

        self._set_refresh_cookie(response, raw_refresh)

        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=UserResponse.model_validate(user)
        )

    async def google_login(
        self,
        payload: GoogleAuthRequest,
        response: Response,
        user_agent: Optional[str] = None,
        ip_address: Optional[str] = None
    ) -> TokenResponse:
        # Verify Google ID Token
        id_info = None
        try:
            if settings.GOOGLE_CLIENT_ID:
                try:
                    id_info = google_id_token.verify_oauth2_token(
                        payload.credential,
                        google_requests.Request(),
                        settings.GOOGLE_CLIENT_ID,
                        clock_skew_in_seconds=600
                    )
                except Exception:
                    # Fallback to Google tokeninfo endpoint if local clock drift occurs
                    async with httpx.AsyncClient() as client:
                        res = await client.get(f"https://oauth2.googleapis.com/tokeninfo?id_token={payload.credential}")
                        if res.status_code == 200:
                            data = res.json()
                            if data.get("aud") == settings.GOOGLE_CLIENT_ID:
                                id_info = data
            else:
                # Fallback token verification via Google API if client id not specified in env
                async with httpx.AsyncClient() as client:
                    res = await client.get(f"https://oauth2.googleapis.com/tokeninfo?id_token={payload.credential}")
                    if res.status_code == 200:
                        id_info = res.json()
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Invalid Google ID token: {str(e)}")


        if not id_info or "email" not in id_info:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not extract verified identity from Google token")

        google_sub = id_info.get("sub")
        email = id_info.get("email")
        full_name = id_info.get("name")
        avatar_url = id_info.get("picture")

        # Find existing user by google_id or email
        user = None
        if google_sub:
            user = await self.auth_repo.get_user_by_google_id(google_sub)

        if not user:
            user = await self.auth_repo.get_user_by_email(email)

        if not user:
            # Create new user for Google Sign-In
            user = await self.auth_repo.create_user(
                email=email,
                hashed_password=None,
                full_name=full_name,
                avatar_url=avatar_url,
                google_id=google_sub,
                is_verified=True
            )
            await self._seed_default_categories(user.id)
        else:
            # Link Google ID if missing
            if not user.google_id and google_sub:
                user.google_id = google_sub
                user.is_verified = True
                if avatar_url:
                    user.avatar_url = avatar_url
                self.auth_repo.db.add(user)
                await self.auth_repo.db.commit()
                await self.auth_repo.db.refresh(user)

        if not user.is_active:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is disabled")

        access_token = create_access_token({"sub": str(user.id)})
        raw_refresh = generate_raw_refresh_token()
        refresh_hash = hash_token(raw_refresh)
        expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

        await self.auth_repo.create_refresh_token(
            user_id=user.id,
            token_hash=refresh_hash,
            expires_at=expires_at,
            user_agent=user_agent,
            ip_address=ip_address
        )

        self._set_refresh_cookie(response, raw_refresh)

        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=UserResponse.model_validate(user)
        )

    async def refresh_token(
        self,
        raw_token: Optional[str],
        response: Response,
        user_agent: Optional[str] = None,
        ip_address: Optional[str] = None
    ) -> TokenResponse:
        if not raw_token:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token missing")

        token_hash = hash_token(raw_token)
        refresh_obj = await self.auth_repo.get_refresh_token(token_hash)

        if not refresh_obj:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

        if refresh_obj.is_revoked:
            # Token reuse detected -> Revoke ALL tokens for this user for safety
            await self.auth_repo.revoke_all_user_refresh_tokens(refresh_obj.user_id)
            self._clear_refresh_cookie(response)
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Revoked refresh token reused. All sessions terminated.")

        if refresh_obj.expires_at < datetime.now(timezone.utc):
            await self.auth_repo.revoke_refresh_token(token_hash)
            self._clear_refresh_cookie(response)
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token expired")

        user = await self.auth_repo.get_user_by_id(refresh_obj.user_id)
        if not user or not user.is_active:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User unavailable or disabled")

        # Refresh Token Rotation: Revoke old token & generate new token
        await self.auth_repo.revoke_refresh_token(token_hash)

        new_access_token = create_access_token({"sub": str(user.id)})
        new_raw_refresh = generate_raw_refresh_token()
        new_refresh_hash = hash_token(new_raw_refresh)
        new_expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

        await self.auth_repo.create_refresh_token(
            user_id=user.id,
            token_hash=new_refresh_hash,
            expires_at=new_expires_at,
            user_agent=user_agent,
            ip_address=ip_address
        )

        self._set_refresh_cookie(response, new_raw_refresh)

        return TokenResponse(
            access_token=new_access_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=UserResponse.model_validate(user)
        )

    async def logout(self, raw_token: Optional[str], response: Response) -> dict:
        if raw_token:
            token_hash = hash_token(raw_token)
            await self.auth_repo.revoke_refresh_token(token_hash)
        self._clear_refresh_cookie(response)
        return {"detail": "Successfully logged out"}

    async def logout_all(self, user_id: uuid.UUID, response: Response) -> dict:
        count = await self.auth_repo.revoke_all_user_refresh_tokens(user_id)
        self._clear_refresh_cookie(response)
        return {"detail": f"Logged out from all devices ({count} sessions terminated)"}

    async def forgot_password(self, payload: ForgotPasswordRequest) -> dict:
        user = await self.auth_repo.get_user_by_email(payload.email)
        if not user:
            # Return uniform response to prevent email enumeration
            return {"detail": "If the email is registered, a password reset email has been sent."}

        raw_reset_token = generate_raw_refresh_token()
        token_hash = hash_token(raw_reset_token)
        expires_at = datetime.now(timezone.utc) + timedelta(hours=1)

        await self.auth_repo.create_password_reset_token(
            user_id=user.id,
            token_hash=token_hash,
            expires_at=expires_at
        )

        # Dispatch email asynchronously via EmailService (SMTP / Resend / Console)
        sent = await EmailService.send_password_reset_email(
            to_email=user.email,
            reset_token=raw_reset_token,
            full_name=user.full_name
        )

        res = {"detail": "If the email is registered, a password reset email has been sent."}
        if (settings.EMAIL_PROVIDER or "").lower() == "console" or settings.ENVIRONMENT == "testing":
            res["reset_token"] = raw_reset_token
        return res


    async def reset_password(self, payload: ResetPasswordRequest) -> dict:
        is_valid, msg = validate_password_strength(payload.new_password)
        if not is_valid:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=msg)

        token_hash = hash_token(payload.token)
        reset_obj = await self.auth_repo.get_password_reset_token(token_hash)

        if not reset_obj or reset_obj.is_used:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired reset token")

        if reset_obj.expires_at < datetime.now(timezone.utc):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Reset token expired")

        new_hashed_pw = hash_password(payload.new_password)
        await self.auth_repo.update_user_password(reset_obj.user_id, new_hashed_pw)
        await self.auth_repo.mark_password_reset_token_used(reset_obj.id)
        # Terminate all active sessions on password reset for security
        await self.auth_repo.revoke_all_user_refresh_tokens(reset_obj.user_id)

        return {"detail": "Password successfully reset. Please log in with your new password."}

    async def change_password(self, user_id: uuid.UUID, payload: ChangePasswordRequest) -> dict:
        user = await self.auth_repo.get_user_by_id(user_id)
        if not user or not user.hashed_password:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Password change not available for OAuth accounts without password")

        if not verify_password(payload.current_password, user.hashed_password):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect current password")

        is_valid, msg = validate_password_strength(payload.new_password)
        if not is_valid:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=msg)

        new_hashed_pw = hash_password(payload.new_password)
        await self.auth_repo.update_user_password(user_id, new_hashed_pw)
        return {"detail": "Password updated successfully"}
