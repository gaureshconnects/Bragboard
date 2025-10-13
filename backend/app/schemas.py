from pydantic import BaseModel, EmailStr
from typing import List, Optional

# ----- Login Request -----
class UserLogin(BaseModel):
    email: EmailStr
    password: str
    role: str  # "admin" or "employee"


# ----- User Creation -----
class UserCreate(BaseModel):
    username: str
    name: str
    email: EmailStr
    password: str
    role: str  # "admin" or "employee"
    department: str
    security_key: Optional[str] = None  # only needed for admin registration

# ----- User Output -----
class UserOut(BaseModel):
    id: int
    username: str
    name: Optional[str] = None
    email: EmailStr
    role: str
    department: str | None = None
    is_active: Optional[bool] = True 
    joining_date: Optional[str] = None
    current_project: Optional[str] = None
    group_members: Optional[str] = None  # <-- optional, default True
    
    class Config:
        orm_mode = True



# ----- Token Schemas -----
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    sub: int  # user id
    exp: int  # expiration timestamp

class UpdateProfile(BaseModel):
    joining_date: Optional[str] = None
    current_project: Optional[str] = None
    group_members: Optional[str] = None