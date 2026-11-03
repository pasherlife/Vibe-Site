"""Translation service layer"""
import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func

from ..models.translation import TranslationString, TranslationSuggestion, TranslationComment, TranslationStatus
from ..models.file import TranslationFile
from ..models.user import User
from ..schemas.translation import (
    TranslationStringUpdate,
    TranslationSuggestionCreate,
    TranslationCommentCreate,
)
from .file import get_file, get_file_strings


def get_translation_string(db: Session, string_id: str) -> Optional[TranslationString]:
    """Get translation string by ID"""
    return db.query(TranslationString).filter(TranslationString.id == string_id).first()


def update_translation_string(
    db: Session,
    string_id: str,
    update_data: TranslationStringUpdate,
    user_id: str,
) -> Optional[TranslationString]:
    """Update translation string"""
    string = get_translation_string(db, string_id)
    if not string:
        return None
    
    # Update fields
    if update_data.target_text is not None:
        string.target_text = update_data.target_text
    if update_data.status is not None:
        string.status = update_data.status
    if update_data.notes is not None:
        string.notes = update_data.notes
    if update_data.is_locked is not None:
        string.is_locked = update_data.is_locked
    
    string.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(string)
    return string


def get_translation_strings_by_file(
    db: Session,
    file_id: str,
    status_filter: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
) -> List[TranslationString]:
    """Get translation strings for a file with optional filtering"""
    query = db.query(TranslationString).filter(TranslationString.file_id == file_id)
    
    if status_filter:
        query = query.filter(TranslationString.status == status_filter)
    
    return query.offset(skip).limit(limit).all()


def get_translation_strings_by_status(
    db: Session,
    file_id: str,
    status: str,
    skip: int = 0,
    limit: int = 100,
) -> List[TranslationString]:
    """Get translation strings by status"""
    return db.query(TranslationString).filter(
        TranslationString.file_id == file_id,
        TranslationString.status == status,
    ).offset(skip).limit(limit).all()


def create_translation_suggestion(
    db: Session,
    suggestion_data: TranslationSuggestionCreate,
    user_id: str,
) -> TranslationSuggestion:
    """Create a new translation suggestion"""
    suggestion = TranslationSuggestion(
        id=str(uuid.uuid4()),
        translation_string_id=suggestion_data.translation_string_id,
        user_id=user_id,
        suggested_text=suggestion_data.suggested_text,
        status="pending",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    
    db.add(suggestion)
    db.commit()
    db.refresh(suggestion)
    return suggestion


def get_translation_suggestions(
    db: Session,
    string_id: str,
    status_filter: Optional[str] = None,
) -> List[TranslationSuggestion]:
    """Get suggestions for a translation string"""
    query = db.query(TranslationSuggestion).filter(
        TranslationSuggestion.translation_string_id == string_id
    )
    
    if status_filter:
        query = query.filter(TranslationSuggestion.status == status_filter)
    
    return query.order_by(TranslationSuggestion.created_at.desc()).all()


def get_translation_suggestion(db: Session, suggestion_id: str) -> Optional[TranslationSuggestion]:
    """Get a specific suggestion"""
    return db.query(TranslationSuggestion).filter(
        TranslationSuggestion.id == suggestion_id
    ).first()


def update_translation_suggestion_status(
    db: Session,
    suggestion_id: str,
    status: str,
    user_id: str,
) -> Optional[TranslationSuggestion]:
    """Update suggestion status (accept/reject)"""
    suggestion = get_translation_suggestion(db, suggestion_id)
    if not suggestion:
        return None
    
    suggestion.status = status
    suggestion.updated_at = datetime.utcnow()
    
    # If accepted, update the translation string
    if status == "accepted":
        string = get_translation_string(db, suggestion.translation_string_id)
        if string:
            string.target_text = suggestion.suggested_text
            string.status = TranslationStatus.TRANSLATED.value
            string.updated_at = datetime.utcnow()
            db.commit()
    
    db.commit()
    db.refresh(suggestion)
    return suggestion


def delete_translation_suggestion(db: Session, suggestion_id: str, user_id: str) -> bool:
    """Delete a translation suggestion"""
    suggestion = get_translation_suggestion(db, suggestion_id)
    if not suggestion or suggestion.user_id != user_id:
        return False
    
    db.delete(suggestion)
    db.commit()
    return True


def create_translation_comment(
    db: Session,
    comment_data: TranslationCommentCreate,
    user_id: str,
) -> TranslationComment:
    """Create a new translation comment"""
    comment = TranslationComment(
        id=str(uuid.uuid4()),
        translation_string_id=comment_data.translation_string_id,
        user_id=user_id,
        parent_id=comment_data.parent_id,
        content=comment_data.content,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment


def get_translation_comments(
    db: Session,
    string_id: str,
    parent_id: Optional[str] = None,
) -> List[TranslationComment]:
    """Get comments for a translation string"""
    query = db.query(TranslationComment).filter(
        TranslationComment.translation_string_id == string_id
    )
    
    if parent_id:
        query = query.filter(TranslationComment.parent_id == parent_id)
    else:
        query = query.filter(TranslationComment.parent_id.is_(None))
    
    return query.order_by(TranslationComment.created_at.desc()).all()


def get_translation_comment(db: Session, comment_id: str) -> Optional[TranslationComment]:
    """Get a specific comment"""
    return db.query(TranslationComment).filter(
        TranslationComment.id == comment_id
    ).first()


def update_translation_comment(
    db: Session,
    comment_id: str,
    content: str,
    user_id: str,
) -> Optional[TranslationComment]:
    """Update a translation comment"""
    comment = get_translation_comment(db, comment_id)
    if not comment or comment.user_id != user_id:
        return None
    
    comment.content = content
    comment.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(comment)
    return comment


def delete_translation_comment(db: Session, comment_id: str, user_id: str) -> bool:
    """Delete a translation comment"""
    comment = get_translation_comment(db, comment_id)
    if not comment or comment.user_id != user_id:
        return False
    
    db.delete(comment)
    db.commit()
    return True


def get_translation_statistics(db: Session, file_id: str) -> Dict[str, Any]:
    """Get translation statistics for a file"""
    strings = db.query(TranslationString).filter(
        TranslationString.file_id == file_id
    ).all()
    
    if not strings:
        return {
            "total": 0,
            "translated": 0,
            "reviewed": 0,
            "approved": 0,
            "untranslated": 0,
            "progress": 0.0,
        }
    
    total = len(strings)
    translated = sum(1 for s in strings if s.status == TranslationStatus.TRANSLATED.value)
    reviewed = sum(1 for s in strings if s.status == TranslationStatus.REVIEWED.value)
    approved = sum(1 for s in strings if s.status == TranslationStatus.APPROVED.value)
    untranslated = sum(1 for s in strings if s.status == TranslationStatus.UNTRANSLATED.value)
    
    progress = (translated + reviewed + approved) / total * 100 if total > 0 else 0.0
    
    return {
        "total": total,
        "translated": translated,
        "reviewed": reviewed,
        "approved": approved,
        "untranslated": untranslated,
        "progress": round(progress, 2),
    }


def get_project_translation_statistics(db: Session, project_id: str) -> Dict[str, Any]:
    """Get aggregated translation statistics for a project"""
    files = db.query(TranslationFile).filter(
        TranslationFile.project_id == project_id
    ).all()
    
    total_strings = 0
    translated_strings = 0
    reviewed_strings = 0
    approved_strings = 0
    
    for file in files:
        stats = get_translation_statistics(db, file.id)
        total_strings += stats["total"]
        translated_strings += stats["translated"]
        reviewed_strings += stats["reviewed"]
        approved_strings += stats["approved"]
    
    progress = (translated_strings + reviewed_strings + approved_strings) / total_strings * 100 if total_strings > 0 else 0.0
    
    return {
        "total_strings": total_strings,
        "translated_strings": translated_strings,
        "reviewed_strings": reviewed_strings,
        "approved_strings": approved_strings,
        "progress": round(progress, 2),
    }


def lock_translation_string(db: Session, string_id: str, user_id: str) -> Optional[TranslationString]:
    """Lock a translation string for editing"""
    string = get_translation_string(db, string_id)
    if not string:
        return None
    
    string.is_locked = True
    string.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(string)
    return string


def unlock_translation_string(db: Session, string_id: str, user_id: str) -> Optional[TranslationString]:
    """Unlock a translation string"""
    string = get_translation_string(db, string_id)
    if not string:
        return None
    
    string.is_locked = False
    string.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(string)
    return string


def search_translations(
    db: Session,
    project_id: Optional[str] = None,
    file_id: Optional[str] = None,
    query: Optional[str] = None,
    status_filter: Optional[str] = None,
    limit: int = 50,
) -> List[TranslationString]:
    """Search translations across files"""
    query_builder = db.query(TranslationString)
    
    if project_id:
        query_builder = query_builder.join(
            TranslationFile, TranslationString.file_id == TranslationFile.id
        ).filter(TranslationFile.project_id == project_id)
    
    if file_id:
        query_builder = query_builder.filter(TranslationString.file_id == file_id)
    
    if query:
        query_builder = query_builder.filter(
            or_(
                TranslationString.key.ilike(f"%{query}%"),
                TranslationString.source_text.ilike(f"%{query}%"),
                TranslationString.target_text.ilike(f"%{query}%"),
            )
        )
    
    if status_filter:
        query_builder = query_builder.filter(TranslationString.status == status_filter)
    
    return query_builder.order_by(TranslationString.updated_at.desc()).limit(limit).all()
