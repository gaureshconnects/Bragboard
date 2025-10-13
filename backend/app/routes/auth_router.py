from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import List
from .routers import admin_router
from .auth import get_current_admin_user
from . import schemas
from .models import User
from .database import get_db

admin_router = APIRouter(prefix="/admin", tags=["Admin"])

# ---------------- GET ALL EMPLOYEES ----------------
@admin_router.get("/employees", response_model=List[schemas.UserOut])
async def list_employees(
    current_admin: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Fetch all employees"""
    result = await db.execute(select(User).where(User.role == "employee"))
    employees = result.scalars().all()
    return employees

# ---------------- DELETE EMPLOYEE ----------------
@admin_router.delete("/employees/{emp_id}")
async def delete_employee(
    emp_id: int,
    current_admin: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).where(and_(User.id == emp_id, User.role == "employee")))
    employee = result.scalars().first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    await db.delete(employee)
    await db.commit()
    return {"msg": "Employee deleted successfully"}

# ---------------- SUSPEND / UNSUSPEND EMPLOYEE ----------------
@admin_router.patch("/employees/{emp_id}/suspend")
async def suspend_employee(
    emp_id: int,
    suspend: bool,  # query parameter
    current_admin: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).where(and_(User.id == emp_id, User.role == "employee")))
    employee = result.scalars().first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    employee.is_active = not suspend
    db.add(employee)
    await db.commit()
    await db.refresh(employee)
    return {"msg": f"Employee {'suspended' if suspend else 'activated'} successfully"}
