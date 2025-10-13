from sqlalchemy import select
from sqlalchemy.exc import NoResultFound
from sqlalchemy.ext.asyncio import AsyncSession
from passlib.context import CryptContext
from .models import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


async def get_user_by_email(db, email: str):
    q = select(User).where(User.email == email)
    res = await db.execute(q)
    return res.scalars().first()


async def get_user_by_username(db, username: str):
    q = select(User).where(User.username == username)
    res = await db.execute(q)
    return res.scalars().first()


# ✅ Modified function to include department
async def create_user(
    db: AsyncSession,
    username: str,
    email: str,
    hashed_password: str,
    role: str,
    name: str,
    department: str = None
):
    new_user = User(
        username=username,
        email=email,
        password=hashed_password,
        role=role,
        name=name,
        department=department  # ✅ added field
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)
