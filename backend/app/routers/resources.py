from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_admin
from app.database import get_db
from app.models import Resource, ResourceCategory, User
from app.schemas import ResourceCreate, ResourceListItemOut, ResourceOut, ResourceUpdate

router = APIRouter(prefix="/api/resources", tags=["resources"])


@router.get("", response_model=list[ResourceListItemOut])
def list_resources(
    category: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    """Public: published resources, newest first. No auth required."""
    q = db.query(Resource).filter(Resource.published.is_(True))
    if category:
        try:
            q = q.filter(Resource.category == ResourceCategory(category))
        except ValueError:
            raise HTTPException(status_code=422, detail=f"Unknown category '{category}'")
    return q.order_by(Resource.published_at.desc()).all()


@router.get("/{slug}", response_model=ResourceOut)
def get_resource(slug: str, db: Session = Depends(get_db)):
    """Public: a single published resource by slug."""
    resource = (
        db.query(Resource)
        .filter(Resource.slug == slug, Resource.published.is_(True))
        .first()
    )
    if not resource:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found")
    return resource


@router.post("", response_model=ResourceOut, status_code=status.HTTP_201_CREATED)
def create_resource(
    payload: ResourceCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Admin-only: create a resource. Editorial content, not user-generated."""
    if db.query(Resource).filter(Resource.slug == payload.slug).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Slug already in use")
    try:
        category = ResourceCategory(payload.category)
    except ValueError:
        raise HTTPException(status_code=422, detail=f"Unknown category '{payload.category}'")

    resource = Resource(
        slug=payload.slug,
        title=payload.title,
        summary=payload.summary,
        body_markdown=payload.body_markdown,
        category=category,
        read_minutes=payload.read_minutes,
        author_name=payload.author_name,
        author_role=payload.author_role,
        published=payload.published,
    )
    db.add(resource)
    db.commit()
    db.refresh(resource)
    return resource


@router.patch("/{slug}", response_model=ResourceOut)
def update_resource(
    slug: str,
    payload: ResourceUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Admin-only: partial update. Unpublishing (published=false) is how a
    resource is retracted without losing its edit history in the row."""
    resource = db.query(Resource).filter(Resource.slug == slug).first()
    if not resource:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found")

    data = payload.model_dump(exclude_unset=True)
    if "category" in data and data["category"] is not None:
        try:
            data["category"] = ResourceCategory(data["category"])
        except ValueError:
            raise HTTPException(status_code=422, detail=f"Unknown category '{data['category']}'")

    for field, value in data.items():
        setattr(resource, field, value)

    db.commit()
    db.refresh(resource)
    return resource


@router.delete("/{slug}", status_code=status.HTTP_204_NO_CONTENT)
def delete_resource(
    slug: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Admin-only: hard delete. Prefer PATCH published=false for retraction;
    this is for genuine mistakes (wrong slug, duplicate, etc.)."""
    resource = db.query(Resource).filter(Resource.slug == slug).first()
    if not resource:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found")
    db.delete(resource)
    db.commit()
