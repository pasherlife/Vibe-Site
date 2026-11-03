"""Project schemas"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict
from ..models.project import ProjectMemberRole


class ProjectBase(BaseModel):
    """Base project schema"""
    name: str = Field(..., min_length=1, max_length=200, description="Project name")
    description: Optional[str] = Field(None, description="Project description")
    icon_url: Optional[str] = Field(None, max_length=500)


class ProjectCreate(ProjectBase):
    """Schema for creating a new project"""
    is_public: bool = False
    allow_join_requests: bool = True
    default_language: str = "en"
    target_languages: str = "uk,en,ru,pl"


class ProjectUpdate(ProjectBase):
    """Schema for updating a project"""
    is_public: Optional[bool] = None
    allow_join_requests: Optional[bool] = None
    default_language: Optional[str] = None
    target_languages: Optional[str] = None


class ProjectResponse(BaseModel):
    """Project response schema"""
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    name: str
    description: Optional[str]
    icon_url: Optional[str]
    owner_id: str
    is_public: bool
    allow_join_requests: bool
    default_language: str
    target_languages: str
    created_at: datetime
    updated_at: datetime
    
    # Computed fields
    members_count: int = 0
    files_count: int = 0
    strings_count: int = 0
    progress: float = 0.0


class ProjectMemberBase(BaseModel):
    """Base project member schema"""
    user_id: str = Field(..., description="User ID")
    role: str = Field(..., description="Member role")


class ProjectMemberCreate(ProjectMemberBase):
    """Schema for adding a member to a project"""
    pass


class ProjectMemberResponse(BaseModel):
    """Project member response schema"""
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    project_id: str
    user_id: str
    role: str
    joined_at: datetime
    updated_at: datetime
    
    # User info
    username: Optional[str] = None
    email: Optional[str] = None
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None


class ProjectMemberUpdate(BaseModel):
    """Schema for updating project member role"""
    role: str = Field(..., description="New role")
