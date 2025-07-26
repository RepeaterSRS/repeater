from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, field_validator


class UserCreate(BaseModel):
    email: EmailStr
    password: str

    @field_validator("email")
    def normalize_email(cls, v):
        return v.lower()


class UserOut(BaseModel):
    id: UUID
    email: EmailStr | None
    role: str
    auth_provider: str
    created_at: datetime
    updated_at: datetime
    is_guest: bool


class UserLogin(BaseModel):
    email: EmailStr
    password: str

    @field_validator("email")
    def normalize_email(cls, v):
        return v.lower()
