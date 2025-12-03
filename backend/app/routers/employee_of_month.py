from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Session
from database import SessionLocal
import models, schemas

Base = declarative_base()

class EmployeeOfMonth(Base):
    __tablename__ = "employee_of_month"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer)
    name = Column(String)
    department = Column(String)

Base.metadata.create_all(bind=SessionLocal().bind)

router = APIRouter(prefix="/employee-of-month", tags=["Employee of Month"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=schemas.EmployeeOfMonthOut)
def set_employee_of_month(data: schemas.EmployeeOfMonthIn, db: Session = Depends(get_db)):
    emp = db.query(models.User).filter(models.User.id == data.employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    record = EmployeeOfMonth(employee_id=emp.id, name=emp.name, department=emp.department)
    db.add(record)
    db.commit()
    db.refresh(record)
    return record
