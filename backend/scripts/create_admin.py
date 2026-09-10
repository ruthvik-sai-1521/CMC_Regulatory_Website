"""
One-off CLI to create (or promote) an admin user.

Usage:
    python -m scripts.create_admin admin@rauzr.local "Admin Name" "SomeStrongPassword123"

Run this against the same DATABASE_URL as the target environment, e.g. on
Railway via `railway run python -m scripts.create_admin ...`.
"""
import sys

from app.core.security import hash_password
from app.database import Base, SessionLocal, engine
from app.models import User


def main():
    if len(sys.argv) != 4:
        print(__doc__)
        sys.exit(1)

    email, full_name, password = sys.argv[1], sys.argv[2], sys.argv[3]
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email.lower()).first()
        if user:
            user.is_admin = True
            print(f"Promoted existing user {email} to admin.")
        else:
            user = User(
                email=email.lower(),
                full_name=full_name,
                hashed_password=hash_password(password),
                is_admin=True,
            )
            db.add(user)
            print(f"Created new admin user {email}.")
        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    main()
