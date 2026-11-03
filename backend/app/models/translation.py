"""Translation string and related models"""
from datetime import datetime
from enum import Enum
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import relationship
from ..core.database import Base


class TranslationStatus(str, Enum):
    """Status of translation strings"""
    UNTRANSLATED = "untranslated"
    TRANSLATED = "translated"
    REVIEWED = "reviewed"
    APPROVED = "approved"
    REJECTED = "rejected"


class TranslationString(Base):
    """Individual translation string"""
    __tablename__ = "translation_strings"
    
    id = Column(String(36), primary_key=True, index=True)
    file_id = Column(String(36), ForeignKey("translation_files.id", ondelete="CASCADE"), nullable=False)
    
    # String content
    key = Column(String(500), nullable=False, index=True)
    source_text = Column(Text, nullable=False)
    target_text = Column(Text, nullable=True)
    
    # Metadata
    context = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    max_length = Column(Integer, nullable=True)
    
    # Status
    status = Column(String(20), default=TranslationStatus.UNTRANSLATED.value, nullable=False)
    is_locked = Column(Boolean, default=False, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    file = relationship("TranslationFile", back_populates="strings")
    suggestions = relationship("TranslationSuggestion", back_populates="translation_string", cascade="all, delete-orphan")
    comments = relationship("TranslationComment", back_populates="translation_string", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<TranslationString(id={self.id}, key={self.key}, status={self.status})>"


class TranslationSuggestion(Base):
    """Suggested translations from users"""
    __tablename__ = "translation_suggestions"
    
    id = Column(String(36), primary_key=True, index=True)
    translation_string_id = Column(String(36), ForeignKey("translation_strings.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    # Suggestion content
    suggested_text = Column(Text, nullable=False)
    
    # Status
    status = Column(String(20), default="pending", nullable=False)  # pending, accepted, rejected
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    translation_string = relationship("TranslationString", back_populates="suggestions")
    user = relationship("User", back_populates="translation_suggestions")
    
    def __repr__(self):
        return f"<TranslationSuggestion(id={self.id}, string_id={self.translation_string_id})>"


class TranslationComment(Base):
    """Comments on translation strings"""
    __tablename__ = "translation_comments"
    
    id = Column(String(36), primary_key=True, index=True)
    translation_string_id = Column(String(36), ForeignKey("translation_strings.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    parent_id = Column(String(36), ForeignKey("translation_comments.id", ondelete="CASCADE"), nullable=True)
    
    # Comment content
    content = Column(Text, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    translation_string = relationship("TranslationString", back_populates="comments")
    user = relationship("User", back_populates="translation_comments")
    parent = relationship("TranslationComment", remote_side=[id], backref="replies")
    
    def __repr__(self):
        return f"<TranslationComment(id={self.id}, string_id={self.translation_string_id})>"
