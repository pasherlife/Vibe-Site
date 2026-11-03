"""Activity log service layer"""
import uuid
import json
from datetime import datetime
from typing import Optional, List, Any, Dict
from sqlalchemy.orm import Session

from ..models.activity import ActivityLog, ActivityType
from ..models.user import User
from ..models.project import Project


def create_activity_log(
    db: Session,
    activity_type: str,
    user_id: Optional[str] = None,
    project_id: Optional[str] = None,
    description: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
) -> ActivityLog:
    """Create a new activity log entry"""
    log = ActivityLog(
        id=str(uuid.uuid4()),
        user_id=user_id,
        project_id=project_id,
        activity_type=activity_type,
        description=description,
        metadata=json.dumps(metadata) if metadata else None,
        ip_address=ip_address,
        user_agent=user_agent,
        created_at=datetime.utcnow(),
    )
    
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


def get_activity_logs(
    db: Session,
    project_id: Optional[str] = None,
    user_id: Optional[str] = None,
    activity_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
) -> List[ActivityLog]:
    """Get activity logs with optional filtering"""
    query = db.query(ActivityLog)
    
    if project_id:
        query = query.filter(ActivityLog.project_id == project_id)
    if user_id:
        query = query.filter(ActivityLog.user_id == user_id)
    if activity_type:
        query = query.filter(ActivityLog.activity_type == activity_type)
    
    return query.order_by(ActivityLog.created_at.desc()).offset(skip).limit(limit).all()


def get_activity_log(db: Session, log_id: str) -> Optional[ActivityLog]:
    """Get a specific activity log"""
    return db.query(ActivityLog).filter(ActivityLog.id == log_id).first()


def get_user_activity(
    db: Session,
    user_id: str,
    skip: int = 0,
    limit: int = 50,
) -> List[ActivityLog]:
    """Get activity logs for a specific user"""
    return db.query(ActivityLog).filter(
        ActivityLog.user_id == user_id
    ).order_by(ActivityLog.created_at.desc()).offset(skip).limit(limit).all()


def get_project_activity(
    db: Session,
    project_id: str,
    skip: int = 0,
    limit: int = 50,
) -> List[ActivityLog]:
    """Get activity logs for a specific project"""
    return db.query(ActivityLog).filter(
        ActivityLog.project_id == project_id
    ).order_by(ActivityLog.created_at.desc()).offset(skip).limit(limit).all()


def get_recent_activity(db: Session, limit: int = 20) -> List[ActivityLog]:
    """Get recent activity across all projects"""
    return db.query(ActivityLog).order_by(
        ActivityLog.created_at.desc()
    ).limit(limit).all()


def log_user_action(
    db: Session,
    action: str,
    user_id: str,
    project_id: Optional[str] = None,
    description: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None,
) -> ActivityLog:
    """Convenience function to log user actions"""
    return create_activity_log(
        db=db,
        activity_type=action,
        user_id=user_id,
        project_id=project_id,
        description=description,
        metadata=metadata,
    )
