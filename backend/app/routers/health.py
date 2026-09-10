import logging
import time

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import get_db

router = APIRouter(tags=["health"])
logger = logging.getLogger("rauzr")

_started_at = time.time()


@router.get("/api/health")
def liveness():
    """Cheap check: process is up. Used by Railway's healthcheck probe."""
    return {"status": "ok", "uptime_seconds": round(time.time() - _started_at)}


@router.get("/api/health/ready")
def readiness(db: Session = Depends(get_db)):
    """Deeper check: can we actually reach the database."""
    try:
        db.execute(text("SELECT 1"))
        db_ok = True
    except Exception as exc:  # pragma: no cover
        logger.exception("Readiness check failed: database unreachable")
        db_ok = False
    return {"status": "ok" if db_ok else "degraded", "database": db_ok}
