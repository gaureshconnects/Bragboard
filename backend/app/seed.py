import asyncio
from app.database import AsyncSessionLocal, engine, Base
from app.admin_models import Admin
from app.utils import get_password_hash

async def seed():
    async with AsyncSessionLocal() as db:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

        admin = Admin(
            email="admin@site.com",
            password=get_password_hash("admin123"),
            name="Super Admin"
        )
        db.add(admin)
        await db.commit()
        print("Admin created successfully!")

if __name__ == "__main__":
    asyncio.run(seed())
