# routers/admin_dashboard_router.py
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ..database import get_db
from ..models import User

router = APIRouter(prefix="/admin", tags=["Admin Dashboard"])

# ✅ Get employee list
@router.get("/employees")
async def get_employees(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.role == "employee"))
    employees = result.scalars().all()
    return {"employees": [e.as_dict() for e in employees]}

# ✅ Dashboard summary
@router.get("/dashboard")
async def get_dashboard_summary(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User))
    users = result.scalars().all()
    admins = [u for u in users if u.role == "admin"]
    employees = [u for u in users if u.role == "employee"]

    return {
        "total_users": len(users),
        "total_admins": len(admins),
        "total_employees": len(employees),
    }
