from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import SessionLocal
import models, schemas

router = APIRouter(prefix="/users", tags=["Users"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=list[schemas.UserOut])
def get_all_users(db: Session = Depends(get_db)):
    return db.query(models.User).all()
