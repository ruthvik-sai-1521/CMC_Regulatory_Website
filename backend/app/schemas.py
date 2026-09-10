from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, EmailStr, Field, field_validator

# ---------- Auth ----------


class UserCreate(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=1, max_length=255)
    company: Optional[str] = Field(default=None, max_length=255)
    password: str = Field(min_length=8, max_length=128)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    company: Optional[str] = None
    is_admin: bool
    created_at: datetime

    class Config:
        from_attributes = True


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---------- Demo booking ----------


class DemoBookingCreate(BaseModel):
    full_name: str = Field(min_length=1, max_length=255)
    work_email: EmailStr
    company: str = Field(min_length=1, max_length=255)
    role: Optional[str] = Field(default=None, max_length=255)
    team_size: Optional[str] = Field(default=None, max_length=50)
    preferred_datetime: Optional[datetime] = None
    message: Optional[str] = Field(default=None, max_length=2000)
    # Honeypot field: real users never fill this in. Any non-empty value
    # is treated as a bot submission and silently dropped.
    website: Optional[str] = Field(default=None, max_length=200)

    @field_validator("message")
    @classmethod
    def strip_message(cls, v: Optional[str]) -> Optional[str]:
        return v.strip() if v else v


class DemoBookingOut(BaseModel):
    id: str
    full_name: str
    work_email: EmailStr
    company: str
    role: Optional[str] = None
    team_size: Optional[str] = None
    preferred_datetime: Optional[datetime] = None
    message: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# ---------- Pipeline ----------


class PipelineRunOut(BaseModel):
    id: str
    dossier_filename: str
    qa_package_filename: str
    status: str
    used_bundled_sample: bool
    compliance_score: Optional[int] = None
    verdict: Optional[str] = None
    report: Optional[Any] = None
    error_message: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ErrorOut(BaseModel):
    detail: str
    code: str


# ---------- Resources ----------


class ResourceBase(BaseModel):
    slug: str = Field(min_length=1, max_length=255, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    title: str = Field(min_length=1, max_length=255)
    summary: str = Field(min_length=1, max_length=500)
    body_markdown: str = Field(min_length=1)
    category: str = Field(default="guide")
    read_minutes: int = Field(default=5, ge=1, le=120)
    author_name: str = Field(min_length=1, max_length=255)
    author_role: str = Field(min_length=1, max_length=255)
    published: bool = True


class ResourceCreate(ResourceBase):
    pass


class ResourceUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    summary: Optional[str] = Field(default=None, min_length=1, max_length=500)
    body_markdown: Optional[str] = None
    category: Optional[str] = None
    read_minutes: Optional[int] = Field(default=None, ge=1, le=120)
    author_name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    author_role: Optional[str] = Field(default=None, min_length=1, max_length=255)
    published: Optional[bool] = None


class ResourceListItemOut(BaseModel):
    id: str
    slug: str
    title: str
    summary: str
    category: str
    read_minutes: int
    author_name: str
    author_role: str
    published_at: datetime

    class Config:
        from_attributes = True


class ResourceOut(ResourceListItemOut):
    body_markdown: str
    published: bool
    updated_at: datetime

    class Config:
        from_attributes = True
