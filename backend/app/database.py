from contextlib import asynccontextmanager
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy import select
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL is None:
    raise ValueError("❌ DATABASE_URL is not set in .env file")

# ✅ Create Async Engine
engine = create_async_engine(
    DATABASE_URL,
    echo=True,  # set to False in production for performance
)

# ✅ Create session factory
AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# ✅ Base class for all models
Base = declarative_base()


# ✅ Dependency for FastAPI routes
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


# ✅ Helper function to fetch a user by email
async def get_user_by_email(session: AsyncSession, email: str, role: str = None):
    """
    Fetch a user by email.
    Optionally filter by role: 'admin' or 'employee'.
    """
    from .models import User  # ✅ Import here to avoid circular import issues

    query = select(User).where(User.email == email)
    if role:
        query = query.where(User.role == role)

    result = await session.execute(query)
    user = result.scalar_one_or_none()
    return user
