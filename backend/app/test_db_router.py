from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from .database import get_db

router = APIRouter()

@router.get("/test-db")
async def test_db(db: AsyncSession = Depends(get_db)):
    result = await db.execute("SELECT 1")
    return {"db_status": "connected", "result": result.scalar()}
