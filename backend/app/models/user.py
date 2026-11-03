"""User model and related enums"""
from datetime import datetime
from enum import Enum
from sqlalchemy import Boolean, Column, DateTime, String, func
from sqlalchemy.orm import relationship
from ..core.database import Base


class UserRole(str, Enum):
    """User roles in the system"""
    ADMIN = "admin"
    TRANSLATOR = "translator"
    REVIEWER = "reviewer"
    USER = "user"


class User(Base):
    """User model for authentication and profiles"""
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    bio = Column(String(1000), nullable=True)
    role = Column(String(20), default=UserRole.USER.value, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    
    # Preferences
    language = Column(String(10), default="uk")
    theme = Column(String(10), default="light")
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    projects_owned = relationship("Project", back_populates="owner", foreign_keys="Project.owner_id")
    project_memberships = relationship("ProjectMember", back_populates="user")
    translation_suggestions = relationship("TranslationSuggestion", back_populates="user")
    translation_comments = relationship("TranslationComment", back_populates="user")
    activity_logs = relationship("ActivityLog", back_populates="user")
    uploaded_files = relationship("TranslationFile", back_populates="uploaded_by")
    
    def __repr__(self):
        return f"<User(id={self.id}, username={self.username}, email={self.email})>"
