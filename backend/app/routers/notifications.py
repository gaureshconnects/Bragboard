# routers/notifications_router.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ..database import get_db
from ..models import Notification

router = APIRouter(prefix="/notifications", tags=["Notifications"])

# ✅ Create a new notification
@router.post("/")
async def create_notification(message: str, db: AsyncSession = Depends(get_db)):
    if not message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    new_notification = Notification(message=message.strip())
    db.add(new_notification)
    await db.commit()
    await db.refresh(new_notification)
    return new_notification

# ✅ Fetch all notifications
@router.get("/")
async def get_notifications(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Notification).order_by(Notification.created_at.desc()))
    notifications = result.scalars().all()
    return notifications
