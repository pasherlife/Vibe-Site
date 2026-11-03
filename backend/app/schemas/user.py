"""User schemas"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from ..models.user import UserRole


class UserBase(BaseModel):
    """Base user schema"""
    username: str = Field(..., min_length=3, max_length=50, description="Username")
    email: EmailStr = Field(..., description="Email address")


class UserCreate(UserBase):
    """Schema for creating a new user"""
    password: str = Field(..., min_length=8, description="Password")
    full_name: Optional[str] = Field(None, max_length=100, description="Full name")


class UserUpdate(BaseModel):
    """Schema for updating user profile"""
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    email: Optional[EmailStr] = None
    full_name: Optional[str] = Field(None, max_length=100)
    avatar_url: Optional[str] = Field(None, max_length=500)
    bio: Optional[str] = Field(None, max_length=1000)
    language: Optional[str] = Field(None, max_length=10)
    theme: Optional[str] = Field(None, max_length=10)


class UserResponse(BaseModel):
    """User response schema"""
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    username: str
    email: EmailStr
    full_name: Optional[str]
    avatar_url: Optional[str]
    role: str
    is_active: bool
    is_verified: bool
    language: str
    theme: str
    created_at: datetime
    last_login: Optional[datetime]


class UserProfileResponse(UserResponse):
    """Extended user profile response"""
    bio: Optional[str]
    projects_owned_count: int = 0
    projects_member_count: int = 0
    translations_count: int = 0
    suggestions_count: int = 0


class UserLogin(BaseModel):
    """User login schema"""
    username: str = Field(..., description="Username or email")
    password: str = Field(..., description="Password")


class TokenResponse(BaseModel):
    """JWT token response"""
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse


class MessageResponse(BaseModel):
    """Simple message response"""
    message: str
