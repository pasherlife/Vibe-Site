"""Translation schemas"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict
from ..models.translation import TranslationStatus


class TranslationStringBase(BaseModel):
    """Base translation string schema"""
    key: str = Field(..., description="Translation key")
    source_text: str = Field(..., description="Source text")
    context: Optional[str] = Field(None, description="Context for translation")
    notes: Optional[str] = Field(None, description="Notes for translator")
    max_length: Optional[int] = Field(None, description="Maximum length for translation")


class TranslationStringResponse(BaseModel):
    """Translation string response schema"""
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    file_id: str
    key: str
    source_text: str
    target_text: Optional[str]
    context: Optional[str]
    notes: Optional[str]
    max_length: Optional[int]
    status: str
    is_locked: bool
    created_at: datetime
    updated_at: datetime
    
    # File info
    filename: Optional[str] = None
    file_type: Optional[str] = None


class TranslationStringUpdate(BaseModel):
    """Schema for updating translation string"""
    target_text: Optional[str] = Field(None, description="Translated text")
    status: Optional[str] = Field(None, description="New status")
    notes: Optional[str] = Field(None, description="Updated notes")
    is_locked: Optional[bool] = Field(None, description="Whether to lock the string")


class TranslationSuggestionBase(BaseModel):
    """Base translation suggestion schema"""
    suggested_text: str = Field(..., description="Suggested translation")


class TranslationSuggestionCreate(TranslationSuggestionBase):
    """Schema for creating a translation suggestion"""
    translation_string_id: str = Field(..., description="Translation string ID")


class TranslationSuggestionResponse(BaseModel):
    """Translation suggestion response schema"""
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    translation_string_id: str
    user_id: Optional[str]
    suggested_text: str
    status: str
    created_at: datetime
    updated_at: datetime
    
    # User info
    username: Optional[str] = None
    full_name: Optional[str] = None


class TranslationSuggestionUpdate(BaseModel):
    """Schema for updating translation suggestion status"""
    status: str = Field(..., description="New status (accepted/rejected)")


class TranslationCommentBase(BaseModel):
    """Base translation comment schema"""
    content: str = Field(..., description="Comment content")


class TranslationCommentCreate(TranslationCommentBase):
    """Schema for creating a translation comment"""
    translation_string_id: str = Field(..., description="Translation string ID")
    parent_id: Optional[str] = Field(None, description="Parent comment ID for replies")


class TranslationCommentResponse(BaseModel):
    """Translation comment response schema"""
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    translation_string_id: str
    user_id: Optional[str]
    parent_id: Optional[str]
    content: str
    created_at: datetime
    updated_at: datetime
    
    # User info
    username: Optional[str] = None
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    
    # Replies
    replies: List["TranslationCommentResponse"] = []


class TranslationStatsResponse(BaseModel):
    """Translation statistics for a file or project"""
    total_strings: int = 0
    translated_strings: int = 0
    reviewed_strings: int = 0
    approved_strings: int = 0
    progress_percentage: float = 0.0
    
    # By status
    untranslated_count: int = 0
    translated_count: int = 0
    reviewed_count: int = 0
    approved_count: int = 0
    rejected_count: int = 0
