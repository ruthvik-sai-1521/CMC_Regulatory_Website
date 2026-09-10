import enum
import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def gen_uuid() -> str:
    return str(uuid.uuid4())


class User(Base):
    """
    Optional account. Nothing on the public site requires a User to exist --
    this table exists purely to gate the authenticated "workspace" demo
    routes and to let a signed-in visitor see their own booking history.
    """

    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    company: Mapped[str | None] = mapped_column(String(255), nullable=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    bookings: Mapped[list["DemoBooking"]] = relationship(back_populates="user")
    pipeline_runs: Mapped[list["PipelineRun"]] = relationship(back_populates="user")


class BookingStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    cancelled = "cancelled"
    completed = "completed"


class DemoBooking(Base):
    """
    A "Book a demo" lead. Intentionally does NOT require authentication --
    matches the reference site's public booking flow. If the visitor happens
    to be logged in, we link the booking to their account for history.
    """

    __tablename__ = "demo_bookings"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    user_id: Mapped[str | None] = mapped_column(ForeignKey("users.id"), nullable=True)

    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    work_email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    company: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str | None] = mapped_column(String(255), nullable=True)
    team_size: Mapped[str | None] = mapped_column(String(50), nullable=True)
    preferred_datetime: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    message: Mapped[str | None] = mapped_column(Text, nullable=True)

    status: Mapped[BookingStatus] = mapped_column(
        Enum(BookingStatus), default=BookingStatus.pending
    )
    # Honeypot + naive rate-limit signal, never shown to the user.
    source_ip: Mapped[str | None] = mapped_column(String(64), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped[User | None] = relationship(back_populates="bookings")


class PipelineRunStatus(str, enum.Enum):
    queued = "queued"
    running = "running"
    succeeded = "succeeded"
    failed = "failed"


class PipelineRun(Base):
    """
    Metadata record for one execution of the core product: ingest -> extract
    -> GxP rule audit. The heavy lifting (PDF parsing, rule evaluation)
    lives in app/services/pipeline.py; this row is the audit trail.
    """

    __tablename__ = "pipeline_runs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    user_id: Mapped[str | None] = mapped_column(ForeignKey("users.id"), nullable=True)

    dossier_filename: Mapped[str] = mapped_column(String(500), nullable=False)
    qa_package_filename: Mapped[str] = mapped_column(String(500), nullable=False)
    status: Mapped[PipelineRunStatus] = mapped_column(
        Enum(PipelineRunStatus), default=PipelineRunStatus.queued
    )
    used_bundled_sample: Mapped[bool] = mapped_column(Boolean, default=False)

    compliance_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    verdict: Mapped[str | None] = mapped_column(String(50), nullable=True)
    report_json: Mapped[str | None] = mapped_column(Text, nullable=True)  # serialized JSON
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    user: Mapped[User | None] = relationship(back_populates="pipeline_runs")


class ResourceCategory(str, enum.Enum):
    guide = "guide"
    regulatory_update = "regulatory_update"
    whitepaper = "whitepaper"
    changelog = "changelog"


class Resource(Base):
    """
    An entry in the public Resources hub (/resources). Real editorial
    content about CMC/GxP regulatory compliance, not user-generated -- CRUD
    is intentionally admin-only (see routers/resources.py); every visitor
    can read, only an authenticated admin can write.
    """

    __tablename__ = "resources"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    slug: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    summary: Mapped[str] = mapped_column(String(500), nullable=False)
    body_markdown: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[ResourceCategory] = mapped_column(
        Enum(ResourceCategory), default=ResourceCategory.guide
    )
    read_minutes: Mapped[int] = mapped_column(Integer, default=5)
    author_name: Mapped[str] = mapped_column(String(255), nullable=False)
    author_role: Mapped[str] = mapped_column(String(255), nullable=False)
    published: Mapped[bool] = mapped_column(Boolean, default=True)
    published_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )
