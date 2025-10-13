from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

load_dotenv()  # must be before reading os.getenv

DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL is None:
    raise ValueError("DATABASE_URL is not set in .env")

# Create engine
engine = create_async_engine(DATABASE_URL, echo=True)

# Create async session
AsyncSessionLocal = sessionmaker(
    bind=engine, class_=AsyncSession, expire_on_commit=False
)

# ✅ Add Base for models to inherit from
Base = declarative_base()


# Dependency for FastAPI
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


# Helper functions for login
async def get_user_by_email(session: AsyncSession, email: str, role: str = None):
    """
    Fetch a user by email.
    Optionally filter by role: 'admin' or 'employee'.
    """
    query = select(User).where(User.email == email)
    if role:
        query = query.where(User.role == role)
    result = await session.execute(query)
    user = result.scalar_one_or_none()
    return user