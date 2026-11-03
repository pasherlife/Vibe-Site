"""Activity log schemas"""
from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel, Field, ConfigDict


class ActivityLogResponse(BaseModel):
    """Activity log response schema"""
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    user_id: Optional[str]
    project_id: Optional[str]
    activity_type: str
    description: Optional[str]
    metadata: Optional[Any] = None
    ip_address: Optional[str]
    user_agent: Optional[str]
    created_at: datetime
    
    # User info
    username: Optional[str] = None
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    
    # Project info
    project_name: Optional[str] = None
