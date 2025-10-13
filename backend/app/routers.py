from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import timedelta
from jose import jwt, JWTError
from passlib.context import CryptContext
import secrets
from typing import Optional, List

from .auth import get_current_admin_user, get_current_user, get_password_hash
from . import auth, crud, schemas
from .database import get_db
from .models import User, SecurityKey

router = APIRouter(prefix="/auth", tags=["Auth"])
admin_router = APIRouter(prefix="/admin", tags=["Admin"])


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ---------------- GET ALL EMPLOYEES ----------------
@admin_router.get("/employees", response_model=List[schemas.UserOut])
async def list_employees(
    current_admin: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Fetch employees based on admin's department.
    Superadmins can see all employees.
    Regular admins can see only employees in their department.
    """
    if current_admin.role == "superadmin":
        # Superadmin sees all employees
        query = select(User).where(User.role == "employee")
    else:
        # Department-wise scoping
        query = select(User).where(
            User.role == "employee",
            User.department == current_admin.department
        )

    result = await db.execute(query)
    employees = result.scalars().all()
    return employees

# ---------------- GET ALL ADMINS ----------------
@admin_router.get("/admins", response_model=List[schemas.UserOut])
async def list_admins(
    current_admin: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Superadmin can view all admins"""
    if current_admin.role != "superadmin":
        raise HTTPException(status_code=403, detail="Forbidden: Only superadmin can view admins")
    
    result = await db.execute(select(User).where(User.role == "admin"))
    admins = result.scalars().all()
    return admins

# ---------------- DELETE ADMIN ----------------
@admin_router.delete("/admins/{admin_id}")
async def delete_admin(
    admin_id: int,
    current_admin: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    if current_admin.role != "superadmin":
        raise HTTPException(status_code=403, detail="Forbidden: Only superadmin can delete admins")
    
    result = await db.execute(select(User).where(User.id == admin_id, User.role == "admin"))
    admin = result.scalars().first()
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    
    await db.delete(admin)
    await db.commit()
    return {"msg": "Admin deleted successfully"}




# ---------------- DELETE EMPLOYEE ----------------
@admin_router.delete("/employees/{emp_id}")
async def delete_employee(
    emp_id: int,
    current_admin: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).where(User.id == emp_id, User.role == "employee"))
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
    suspend: bool,
    current_admin: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Suspend or unsuspend employee"""
    result = await db.execute(select(User).where(User.id == emp_id, User.role == "employee"))
    employee = result.scalars().first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    # Add a new column to User model called 'is_active' (Boolean, default=True)
    employee.is_active = not suspend
    db.add(employee)
    await db.commit()
    await db.refresh(employee)
    return {"msg": f"Employee {'suspended' if suspend else 'activated'} successfully"}

# ---------------- ADMIN-ONLY ROUTE ----------------
@router.post("/admin-only-route")
async def admin_action(
    current_admin: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    return {"msg": f"Hello, admin {current_admin.username}"}

# ---------------- REGISTER ----------------
@router.post("/register", response_model=schemas.UserOut)
async def register_user(user: schemas.UserCreate, db: AsyncSession = Depends(get_db)):
    # Check if email/username exists
    if await crud.get_user_by_email(db, user.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    if await crud.get_user_by_username(db, user.username):
        raise HTTPException(status_code=400, detail="Username already taken")

    # Security Key Check for admin registration
    if user.role == "admin":
        if not user.security_key:
            raise HTTPException(status_code=403, detail="Security key is required for admin registration")
        q = select(SecurityKey).where(SecurityKey.key == user.security_key, SecurityKey.is_used == False)
        res = await db.execute(q)
        key_obj = res.scalars().first()
        if not key_obj:
            raise HTTPException(status_code=403, detail="Invalid or already used security key")
        # Mark key as used
        key_obj.is_used = True
        await db.commit()

    # Create new user
    hashed_password = get_password_hash(user.password)
    new_user = await crud.create_user(
        db,
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        role=user.role,
        name=user.name,
        department=user.department
    )
    return new_user

# ---------------- LOGIN ----------------
@router.post("/login", response_model=schemas.Token)
async def login_user(
    response: Response,
    user_credentials: schemas.UserLogin,
    db: AsyncSession = Depends(get_db)
):
    user = await auth.authenticate_user(db, user_credentials.email, user_credentials.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    access_token_expires = timedelta(minutes=auth.settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(data={"sub": str(user.id)}, expires_delta=access_token_expires)

    refresh_token_expires = timedelta(days=auth.settings.REFRESH_TOKEN_EXPIRE_DAYS)
    refresh_token = auth.create_refresh_token(data={"sub": str(user.id)}, expires_delta=refresh_token_expires)

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        max_age=60 * 60 * 24 * auth.settings.REFRESH_TOKEN_EXPIRE_DAYS,
        samesite="lax",
        secure=False
    )

    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

# ---------------- REFRESH ----------------
@router.post("/refresh", response_model=schemas.Token)
async def refresh_token(request: Request, db: AsyncSession = Depends(get_db)):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Missing refresh token")
    try:
        payload = jwt.decode(refresh_token, auth.settings.SECRET_KEY, algorithms=[auth.settings.ALGORITHM])
        user_id = int(payload.get("sub"))
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    q = select(User).where(User.id == user_id)
    res = await db.execute(q)
    user = res.scalars().first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    access_token_expires = timedelta(minutes=auth.settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(data={"sub": str(user.id)}, expires_delta=access_token_expires)

    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

# ---------------- LOGOUT ----------------
@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("refresh_token")
    return {"msg": "logged out"}

# ---------------- CURRENT USER ----------------
@router.get("/me", response_model=schemas.UserOut)
async def me(token: str = Depends(auth.oauth2_scheme), db: AsyncSession = Depends(get_db)):
    try:
        payload = jwt.decode(token, auth.settings.SECRET_KEY, algorithms=[auth.settings.ALGORITHM])
        user_id = int(payload.get("sub"))
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    q = select(User).where(User.id == user_id)
    res = await db.execute(q)
    user = res.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user

# ---------------- SECURITY KEY MANAGEMENT ----------------
def generate_security_key(length=16) -> str:
    """Generate a secure random URL-safe key"""
    return secrets.token_urlsafe(length)

# Create a new security key (admin-only)
@router.post("/security-keys", dependencies=[Depends(get_current_admin_user)])
async def create_security_key(db: AsyncSession = Depends(get_db)):
    key_value = generate_security_key(16)
    new_key = SecurityKey(key=key_value)
    db.add(new_key)
    await db.commit()
    await db.refresh(new_key)
    return {"security_key": new_key.key, "id": new_key.id}

# List all security keys (admin-only)
@router.get("/security-keys", dependencies=[Depends(get_current_admin_user)])
async def list_security_keys(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SecurityKey))
    keys = result.scalars().all()
    return [{"id": k.id, "key": k.key, "is_used": k.is_used} for k in keys]

# Delete a security key (admin-only)
@router.delete("/security-keys/{key_id}", dependencies=[Depends(get_current_admin_user)])
async def delete_security_key(key_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SecurityKey).where(SecurityKey.id == key_id))
    key_obj = result.scalars().first()
    if not key_obj:
        raise HTTPException(status_code=404, detail="Key not found")
    await db.delete(key_obj)
    await db.commit()
    return {"msg": "Key deleted"}


# ✅ Fetch department-wise employees (used for dropdown)
@router.get("/department-employees")
async def get_department_employees(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = await db.execute(select(User).where(User.department == current_user.department))
    employees = query.scalars().all()
    return [{"id": emp.id, "name": emp.name} for emp in employees]


# ✅ Update profile details
@router.put("/update-profile", response_model=schemas.UserOut)
async def update_profile(
    user_update: schemas.UpdateProfile,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = await db.execute(select(User).where(User.id == current_user.id))
    user = query.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.joining_date = user_update.joining_date
    user.current_project = user_update.current_project
    user.group_members = ",".join(user_update.group_members)

    db.add(user)
    await db.commit()
    await db.refresh(user)

    return user