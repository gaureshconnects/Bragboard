from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Boolean, func
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base
from sqlalchemy.dialects.postgresql import JSONB


# ---------------- USER MODEL ----------------
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(String(10), nullable=False, default="employee")
    name = Column(String(100), nullable=False)
    department = Column(String(100), nullable=False)
    joining_date = Column(String, nullable=True)
    current_project = Column(String, nullable=True)
    group_members = Column(String, nullable=True)
    skills = Column(String, nullable=True)
    experience = Column(String, nullable=True)
    
    # ✅ Relationships
    shoutouts = relationship("ShoutOut", back_populates="author", cascade="all, delete-orphan")
    comments = relationship("ShoutOutComment", back_populates="user")
    reactions = relationship("ShoutOutReaction", back_populates="user")
    tags = relationship("ShoutOutTag", back_populates="user")

    # ✅ Back-populate notifications
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")

# ---------------- SECURITY KEY ----------------
class SecurityKey(Base):
    __tablename__ = "security_keys"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, nullable=False)
    is_used = Column(Boolean, default=False)


# ---------------- SHOUTOUT ----------------
class ShoutOut(Base):
    __tablename__ = "shoutouts"

    id = Column(Integer, primary_key=True, index=True)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    message = Column(Text, nullable=False)
    image_url = Column(String(500), nullable=True)
    department = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_reported = Column(Boolean, default=False)
    reactions = Column(JSONB, default={})  # ✅ this must exist

    # ✅ Relationships
    author = relationship("User", back_populates="shoutouts")
    tags = relationship("ShoutOutTag", back_populates="shoutout", cascade="all, delete-orphan")
    reactions = relationship("ShoutOutReaction", back_populates="shoutout", cascade="all, delete-orphan")
    comments = relationship("ShoutOutComment", back_populates="shoutout", cascade="all, delete-orphan")


# ---------------- SHOUTOUT TAG ----------------
class ShoutOutTag(Base):
    __tablename__ = "shoutout_tags"

    id = Column(Integer, primary_key=True, index=True)
    shoutout_id = Column(Integer, ForeignKey("shoutouts.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    user = relationship("User", back_populates="tags")
    shoutout = relationship("ShoutOut", back_populates="tags")


# ---------------- SHOUTOUT REACTION ----------------
class ShoutOutReaction(Base):
    __tablename__ = "shoutout_reactions"

    id = Column(Integer, primary_key=True, index=True)
    shoutout_id = Column(Integer, ForeignKey("shoutouts.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    emoji = Column(String(10), nullable=False)

    user = relationship("User", back_populates="reactions")
    shoutout = relationship("ShoutOut", back_populates="reactions")


# ---------------- SHOUTOUT COMMENT ----------------
class ShoutOutComment(Base):
    __tablename__ = "shoutout_comments"

    id = Column(Integer, primary_key=True, index=True)
    shoutout_id = Column(Integer, ForeignKey("shoutouts.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="comments")
    shoutout = relationship("ShoutOut", back_populates="comments")


# ---------------- NOTIFICATIONS (for admin messages) ----------------
class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    message = Column(String(255), nullable=False)

    # ✅ Add this missing column:
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # ✅ Optional: department tracking
    department = Column(String(100), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    # ✅ Relationship back to User model
    user = relationship("User", back_populates="notifications")

# ---------------- EMPLOYEE OF THE MONTH MODEL ----------------

class EmployeeOfMonth(Base):
    __tablename__ = "employee_of_month"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    month_year = Column(Text, nullable=True)
    name = Column(String(255), nullable=False)
    department = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=False), server_default=func.now())

    # optional relationship if needed
    employee = relationship("User")


# --------------------Notification Model --------------------

