import uuid
from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.models.refresh_token import RefreshToken
from app.models.password_reset import PasswordResetToken

class AuthRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_user_by_id(self, user_id: uuid.UUID) -> Optional[User]:
        stmt = select(User).where(User.id == user_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_user_by_email(self, email: str) -> Optional[User]:
        stmt = select(User).where(User.email.ilike(email.strip()))
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_user_by_google_id(self, google_id: str) -> Optional[User]:
        stmt = select(User).where(User.google_id == google_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def create_user(
        self,
        email: str,
        hashed_password: Optional[str] = None,
        full_name: Optional[str] = None,
        avatar_url: Optional[str] = None,
        google_id: Optional[str] = None,
        is_verified: bool = False
    ) -> User:
        user = User(
            id=uuid.uuid4(),
            email=email.strip().lower(),
            hashed_password=hashed_password,
            full_name=full_name,
            avatar_url=avatar_url,
            google_id=google_id,
            is_verified=is_verified
        )
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def update_user_password(self, user_id: uuid.UUID, hashed_password: str) -> bool:
        stmt = (
            update(User)
            .where(User.id == user_id)
            .values(hashed_password=hashed_password, updated_at=datetime.now(timezone.utc))
        )
        result = await self.db.execute(stmt)
        await self.db.commit()
        return result.rowcount > 0

    async def create_refresh_token(
        self,
        user_id: uuid.UUID,
        token_hash: str,
        expires_at: datetime,
        user_agent: Optional[str] = None,
        ip_address: Optional[str] = None
    ) -> RefreshToken:
        refresh_token = RefreshToken(
            id=uuid.uuid4(),
            user_id=user_id,
            token_hash=token_hash,
            expires_at=expires_at,
            user_agent=user_agent,
            ip_address=ip_address
        )
        self.db.add(refresh_token)
        await self.db.commit()
        await self.db.refresh(refresh_token)
        return refresh_token

    async def get_refresh_token(self, token_hash: str) -> Optional[RefreshToken]:
        stmt = select(RefreshToken).where(RefreshToken.token_hash == token_hash)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def revoke_refresh_token(self, token_hash: str) -> bool:
        stmt = (
            update(RefreshToken)
            .where(RefreshToken.token_hash == token_hash)
            .values(is_revoked=True)
        )
        result = await self.db.execute(stmt)
        await self.db.commit()
        return result.rowcount > 0

    async def revoke_all_user_refresh_tokens(self, user_id: uuid.UUID) -> int:
        stmt = (
            update(RefreshToken)
            .where(RefreshToken.user_id == user_id, RefreshToken.is_revoked == False)
            .values(is_revoked=True)
        )
        result = await self.db.execute(stmt)
        await self.db.commit()
        return result.rowcount

    async def create_password_reset_token(
        self,
        user_id: uuid.UUID,
        token_hash: str,
        expires_at: datetime
    ) -> PasswordResetToken:
        reset_token = PasswordResetToken(
            id=uuid.uuid4(),
            user_id=user_id,
            token_hash=token_hash,
            expires_at=expires_at
        )
        self.db.add(reset_token)
        await self.db.commit()
        await self.db.refresh(reset_token)
        return reset_token

    async def get_password_reset_token(self, token_hash: str) -> Optional[PasswordResetToken]:
        stmt = select(PasswordResetToken).where(PasswordResetToken.token_hash == token_hash)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def mark_password_reset_token_used(self, token_id: uuid.UUID) -> bool:
        stmt = (
            update(PasswordResetToken)
            .where(PasswordResetToken.id == token_id)
            .values(is_used=True)
        )
        result = await self.db.execute(stmt)
        await self.db.commit()
        return result.rowcount > 0
