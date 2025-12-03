from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

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
    department: Optional[str] = None
    is_active: Optional[bool] = True
    joining_date: Optional[str] = None
    current_project: Optional[str] = None
    group_members: Optional[str] = None
    appreciation_score: Optional[int] = 0

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


# ----- Profile Update -----
class UpdateProfile(BaseModel):
    joining_date: Optional[str] = None
    current_project: Optional[str] = None
    group_members: Optional[str] = None


# ----- ShoutOut Schemas -----
class ShoutOutOut(BaseModel):
    id: int
    author_id: int
    author_name: str
    message: str
    image_url: Optional[str] = None
    created_at: Optional[str] = None
    tagged_users: List[int] = []
    tagged_user_names: List[str] = []
    reactions: dict = {}
    comments_count: int = 0

    class Config:
        from_attributes = True


class ShoutOutCommentOut(BaseModel):
    id: int
    content: str
    created_at: Optional[str] = None
    user_id: int

    class Config:
        from_attributes = True


# ----- Metrics -----
class MetricsOut(BaseModel):
    shoutouts_given: int
    shoutouts_received: int
    comments_made: int
    recent: List[dict]


# ----- Reaction & Comment Schemas -----
class ReactionIn(BaseModel):
    emoji: str


class CommentIn(BaseModel):
    content: str


class CommentOut(BaseModel):
    id: int
    content: str
    created_at: Optional[str] = None
    user_id: int

    class Config:
        from_attributes = True


class CommentCreate(BaseModel):
    content: str


# ----- ShoutOut Update -----
class ShoutOutUpdate(BaseModel):
    message: Optional[str] = None
    image_url: Optional[str] = None
    tagged_users: Optional[List[int]] = None

# ----- Notification Schemas -----
class NotificationCreate(BaseModel):
    message: str

# ---------------- EMPLOYEE OF THE MONTH SCHEMAS ----------------
class EmployeeOfMonthCreate(BaseModel):
    employee_id: int

class EmployeeOfMonthOut(BaseModel):
    id: int
    employee_id: int
    name: str
    department: Optional[str] = None
    created_at: datetime
    month_year: Optional[str] = None

    class Config:
        from_attributes = True

#------------------------ Reported ny users Schemas ------------------------
class ShoutoutCreate(BaseModel):
    message: str
    department: Optional[str] = None

class ShoutoutResponse(BaseModel):
    id: int
    author_id: int
    author_name: Optional[str] = None
    message: str
    department: Optional[str] = None
    is_reported: bool
    created_at: datetime

    class Config:
        from_attributes = True  # replaces orm_mode in Pydantic v2