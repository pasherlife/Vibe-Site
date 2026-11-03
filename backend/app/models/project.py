"""Project model and related entities"""
from datetime import datetime
from enum import Enum
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import relationship
from ..core.database import Base


class ProjectMemberRole(str, Enum):
    """Roles for project members"""
    OWNER = "owner"
    ADMIN = "admin"
    TRANSLATOR = "translator"
    REVIEWER = "reviewer"
    VIEWER = "viewer"


class Project(Base):
    """Project model for organizing translation work"""
    __tablename__ = "projects"
    
    id = Column(String(36), primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    icon_url = Column(String(500), nullable=True)
    
    # Owner
    owner_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    owner = relationship("User", back_populates="projects_owned", foreign_keys=[owner_id])
    
    # Settings
    is_public = Column(Boolean, default=False, nullable=False)
    allow_join_requests = Column(Boolean, default=True, nullable=False)
    default_language = Column(String(10), default="uk")
    target_languages = Column(String(255), default="uk,en,ru,pl")  # Comma-separated
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    members = relationship("ProjectMember", back_populates="project", cascade="all, delete-orphan")
    files = relationship("TranslationFile", back_populates="project", cascade="all, delete-orphan")
    activity_logs = relationship("ActivityLog", back_populates="project")
    
    def __repr__(self):
        return f"<Project(id={self.id}, name={self.name}, owner_id={self.owner_id})>"


class ProjectMember(Base):
    """Project member association table with additional fields"""
    __tablename__ = "project_members"
    
    id = Column(String(36), primary_key=True, index=True)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(20), default=ProjectMemberRole.VIEWER.value, nullable=False)
    
    # Timestamps
    joined_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    project = relationship("Project", back_populates="members")
    user = relationship("User", back_populates="project_memberships")
    
    __table_args__ = (
        # Composite unique constraint
        __table_args__ = (
            {"unique_constraint": ("project_id", "user_id")},
        ) if True else None
    )
    
    def __repr__(self):
        return f"<ProjectMember(project_id={self.project_id}, user_id={self.user_id}, role={self.role})>"
