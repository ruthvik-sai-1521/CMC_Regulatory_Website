from typing import Optional

from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_admin, get_current_user_optional
from app.database import get_db
from app.models import DemoBooking, User
from app.schemas import DemoBookingCreate, DemoBookingOut

router = APIRouter(prefix="/api/demo-bookings", tags=["demo-bookings"])


@router.post("", response_model=Optional[DemoBookingOut], status_code=status.HTTP_201_CREATED)
def create_booking(
    payload: DemoBookingCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    # Honeypot check: bots fill every field including hidden ones. Return a
    # fake-success 201 with no body so the bot doesn't learn its request was
    # rejected, while nothing is persisted.
    if payload.website:
        return None

    booking = DemoBooking(
        user_id=current_user.id if current_user else None,
        full_name=payload.full_name,
        work_email=payload.work_email,
        company=payload.company,
        role=payload.role,
        team_size=payload.team_size,
        preferred_datetime=payload.preferred_datetime,
        message=payload.message,
        source_ip=request.client.host if request.client else None,
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking


@router.get("/mine", response_model=list[DemoBookingOut])
def my_bookings(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    if not current_user:
        return []
    return (
        db.query(DemoBooking)
        .filter(DemoBooking.user_id == current_user.id)
        .order_by(DemoBooking.created_at.desc())
        .all()
    )


@router.get("", response_model=list[DemoBookingOut])
def list_all_bookings(db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    """Admin-only: view every booking lead. Requires is_admin=True."""
    return db.query(DemoBooking).order_by(DemoBooking.created_at.desc()).all()
