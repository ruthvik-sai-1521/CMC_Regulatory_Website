import json
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user_optional
from app.database import get_db
from app.models import PipelineRun, PipelineRunStatus, User
from app.schemas import PipelineRunOut
from app.services.pipeline import run_pipeline

router = APIRouter(prefix="/api/pipeline", tags=["pipeline"])

MAX_UPLOAD_BYTES = 15 * 1024 * 1024  # 15 MB per file
ALLOWED_CONTENT_TYPES = {"application/pdf"}


async def _read_validated(upload: Optional[UploadFile]) -> Optional[bytes]:
    if upload is None:
        return None
    if upload.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"'{upload.filename}' must be a PDF file.",
        )
    contents = await upload.read()
    if len(contents) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"'{upload.filename}' exceeds the 15 MB upload limit.",
        )
    if len(contents) == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"'{upload.filename}' is empty.")
    return contents


@router.post("/run-sample", response_model=PipelineRunOut)
def run_bundled_sample(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    """Public, no-auth, no-upload demo entry point -- matches the reference
    product's 'Run With Bundled Sample Package' button."""
    record = PipelineRun(
        user_id=current_user.id if current_user else None,
        dossier_filename="sample_ich_ctd_module_3.2.s.pdf",
        qa_package_filename="sample_site_qa_package.pdf",
        used_bundled_sample=True,
        status=PipelineRunStatus.running,
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    try:
        result = run_pipeline(None, None, use_bundled_sample=True)
        record.status = PipelineRunStatus.succeeded
        record.compliance_score = result["score"]
        record.verdict = result["verdict"]
        record.report_json = json.dumps(result)
    except Exception as exc:  # pragma: no cover - defensive
        record.status = PipelineRunStatus.failed
        record.error_message = str(exc)
    record.completed_at = datetime.utcnow()
    db.commit()
    db.refresh(record)

    return _to_out(record)


@router.post("/run", response_model=PipelineRunOut)
async def run_uploaded_files(
    dossier: UploadFile = File(..., description="Regulatory dossier PDF (ICH CTD Module 3.2.S)"),
    qa_package: UploadFile = File(..., description="Site QA / eBMR / batch audit PDF"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    dossier_bytes = await _read_validated(dossier)
    qa_bytes = await _read_validated(qa_package)

    record = PipelineRun(
        user_id=current_user.id if current_user else None,
        dossier_filename=dossier.filename or "dossier.pdf",
        qa_package_filename=qa_package.filename or "qa_package.pdf",
        used_bundled_sample=False,
        status=PipelineRunStatus.running,
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    try:
        result = run_pipeline(dossier_bytes, qa_bytes, use_bundled_sample=False)
        record.status = PipelineRunStatus.succeeded
        record.compliance_score = result["score"]
        record.verdict = result["verdict"]
        record.report_json = json.dumps(result)
    except Exception as exc:
        record.status = PipelineRunStatus.failed
        record.error_message = "The pipeline could not process one of the uploaded PDFs. Please verify the files are text-based (not scanned images) and try again."
    record.completed_at = datetime.utcnow()
    db.commit()
    db.refresh(record)

    if record.status == PipelineRunStatus.failed:
        # Still return 200 with a failed-status body: this is an expected,
        # user-actionable outcome, not a server error.
        return _to_out(record)

    return _to_out(record)


@router.get("/runs/{run_id}", response_model=PipelineRunOut)
def get_run(run_id: str, db: Session = Depends(get_db)):
    record = db.get(PipelineRun, run_id)
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pipeline run not found")
    return _to_out(record)


@router.get("/runs", response_model=list[PipelineRunOut])
def my_runs(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    if not current_user:
        return []
    records = (
        db.query(PipelineRun)
        .filter(PipelineRun.user_id == current_user.id)
        .order_by(PipelineRun.created_at.desc())
        .limit(50)
        .all()
    )
    return [_to_out(r) for r in records]


def _to_out(record: PipelineRun) -> PipelineRunOut:
    report = json.loads(record.report_json) if record.report_json else None
    return PipelineRunOut(
        id=record.id,
        dossier_filename=record.dossier_filename,
        qa_package_filename=record.qa_package_filename,
        status=record.status.value if hasattr(record.status, "value") else record.status,
        used_bundled_sample=record.used_bundled_sample,
        compliance_score=record.compliance_score,
        verdict=record.verdict,
        report=report,
        error_message=record.error_message,
        created_at=record.created_at,
        completed_at=record.completed_at,
    )
