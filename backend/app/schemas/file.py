"""File schemas"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict
from ..models.file import FileStatus, FileType


class FileBase(BaseModel):
    """Base file schema"""
    filename: str
    file_type: str
    source_language: str = "en"
    target_language: str = "uk"


class FileUploadResponse(BaseModel):
    """Response after file upload"""
    id: str
    filename: str
    original_filename: str
    file_type: str
    file_size: int
    status: str
    project_id: str
    total_strings: int = 0
    message: Optional[str] = None


class FileResponse(BaseModel):
    """File response schema"""
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    project_id: str
    uploaded_by_id: Optional[str]
    filename: str
    original_filename: str
    file_type: str
    file_path: str
    file_size: int
    source_language: str
    target_language: str
    status: str
    error_message: Optional[str]
    total_strings: int
    translated_strings: int
    reviewed_strings: int
    created_at: datetime
    updated_at: datetime
    
    # Uploaded by user info
    uploaded_by_username: Optional[str] = None
    uploaded_by_full_name: Optional[str] = None


class FileVersionResponse(BaseModel):
    """File version response schema"""
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    file_id: str
    version_number: int
    filename: str
    file_path: str
    file_size: int
    changelog: Optional[str]
    created_at: datetime


class FileUpdate(BaseModel):
    """Schema for updating file metadata"""
    source_language: Optional[str] = None
    target_language: Optional[str] = None
