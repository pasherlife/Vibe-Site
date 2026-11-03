"""Activity log model"""
from datetime import datetime
from enum import Enum
from sqlalchemy import Column, DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import relationship
from ..core.database import Base


class ActivityType(str, Enum):
    """Types of activities"""
    # User activities
    USER_REGISTERED = "user_registered"
    USER_LOGIN = "user_login"
    USER_LOGOUT = "user_logout"
    USER_PROFILE_UPDATED = "user_profile_updated"
    
    # Project activities
    PROJECT_CREATED = "project_created"
    PROJECT_UPDATED = "project_updated"
    PROJECT_DELETED = "project_deleted"
    PROJECT_MEMBER_JOINED = "project_member_joined"
    PROJECT_MEMBER_LEFT = "project_member_left"
    PROJECT_MEMBER_ROLE_CHANGED = "project_member_role_changed"
    
    # File activities
    FILE_UPLOADED = "file_uploaded"
    FILE_DELETED = "file_deleted"
    FILE_VERSION_CREATED = "file_version_created"
    
    # Translation activities
    TRANSLATION_ADDED = "translation_added"
    TRANSLATION_UPDATED = "translation_updated"
    TRANSLATION_STATUS_CHANGED = "translation_status_changed"
    TRANSLATION_SUGGESTION_ADDED = "translation_suggestion_added"
    TRANSLATION_SUGGESTION_ACCEPTED = "translation_suggestion_accepted"
    TRANSLATION_COMMENT_ADDED = "translation_comment_added"


class ActivityLog(Base):
    """Activity log for tracking user actions"""
    __tablename__ = "activity_logs"
    
    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="SET NULL"), nullable=True)
    
    # Activity info
    activity_type = Column(String(50), nullable=False, index=True)
    description = Column(Text, nullable=True)
    metadata = Column(Text, nullable=True)  # JSON string for additional data
    
    # IP and user agent
    ip_address = Column(String(50), nullable=True)
    user_agent = Column(String(500), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="activity_logs")
    project = relationship("Project", back_populates="activity_logs")
    
    def __repr__(self):
        return f"<ActivityLog(id={self.id}, type={self.activity_type}, user_id={self.user_id})>"
