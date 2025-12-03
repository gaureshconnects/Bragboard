from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import SessionLocal
import models, schemas

router = APIRouter(prefix="/posts", tags=["ShoutOuts"])  # React expects /posts

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=list[schemas.ShoutOutOut])
def get_all_shoutouts(db: Session = Depends(get_db)):
    return db.query(models.ShoutOut).all()