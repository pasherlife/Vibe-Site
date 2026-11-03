"""File models for translation files"""
from datetime import datetime
from enum import Enum
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import relationship
from ..core.database import Base


class FileStatus(str, Enum):
    """Status of translation files"""
    PENDING = "pending"
    PROCESSING = "processing"
    READY = "ready"
    ERROR = "error"


class FileType(str, Enum):
    """Supported file types"""
    LOCRES = "locres"
    CSV = "csv"
    JSON = "json"
    TXT = "txt"


class TranslationFile(Base):
    """Translation file model"""
    __tablename__ = "translation_files"
    
    id = Column(String(36), primary_key=True, index=True)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    uploaded_by_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    # File info
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_type = Column(String(20), nullable=False)  # FileType enum
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer, nullable=False)
    
    # Metadata
    source_language = Column(String(10), default="en")
    target_language = Column(String(10), default="uk")
    status = Column(String(20), default=FileStatus.PENDING.value, nullable=False)
    error_message = Column(Text, nullable=True)
    
    # Statistics
    total_strings = Column(Integer, default=0)
    translated_strings = Column(Integer, default=0)
    reviewed_strings = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    project = relationship("Project", back_populates="files")
    uploaded_by = relationship("User", back_populates="uploaded_files")
    versions = relationship("FileVersion", back_populates="file", cascade="all, delete-orphan")
    strings = relationship("TranslationString", back_populates="file", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<TranslationFile(id={self.id}, filename={self.filename}, project_id={self.project_id})>"


class FileVersion(Base):
    """File version history"""
    __tablename__ = "file_versions"
    
    id = Column(String(36), primary_key=True, index=True)
    file_id = Column(String(36), ForeignKey("translation_files.id", ondelete="CASCADE"), nullable=False)
    version_number = Column(Integer, nullable=False)
    
    # File info
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer, nullable=False)
    
    # Metadata
    changelog = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    file = relationship("TranslationFile", back_populates="versions")
    
    def __repr__(self):
        return f"<FileVersion(id={self.id}, file_id={self.file_id}, version={self.version_number})>"
