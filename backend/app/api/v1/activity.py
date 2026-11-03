"""Activity log endpoints"""
from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from ...core.database import get_db
from ...models.user import User, UserRole
from ...models.project import ProjectMemberRole
from ...schemas.activity import ActivityLogResponse
from ...services.activity import (
    get_activity_logs,
    get_activity_log,
    get_user_activity,
    get_project_activity,
    get_recent_activity,
)
from ...services.project import check_project_permission
from ...utils.security import get_current_user, has_role

router = APIRouter(prefix="/activity", tags=["Activity"])


@router.get("/recent", response_model=List[ActivityLogResponse])
async def get_recent_activity_endpoint(
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get recent activity"""
    # For now, return recent activity for projects user has access to
    # In production, you might want to filter this more carefully
    
    # Get user's projects
    from ...services.project import get_user_projects
    projects = get_user_projects(db, current_user.id)
    project_ids = [p.id for p in projects]
    
    # Get recent activity for these projects
    logs = get_recent_activity(db, limit)
    
    # Filter by accessible projects
    accessible_logs = []
    for log in logs:
        if log.project_id in project_ids or log.user_id == current_user.id:
            accessible_logs.append(log)
    
    responses = []
    for log in accessible_logs[:limit]:
        user = log.user
        project = log.project
        responses.append(ActivityLogResponse(
            **log.__dict__,
            username=user.username if user else None,
            full_name=user.full_name if user else None,
            avatar_url=user.avatar_url if user else None,
            project_name=project.name if project else None,
        ))
    
    return responses


@router.get("/user", response_model=List[ActivityLogResponse])
async def get_my_activity(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get current user's activity"""
    logs = get_user_activity(db, current_user.id, skip=skip, limit=limit)
    
    responses = []
    for log in logs:
        user = log.user
        project = log.project
        responses.append(ActivityLogResponse(
            **log.__dict__,
            username=user.username if user else None,
            full_name=user.full_name if user else None,
            avatar_url=user.avatar_url if user else None,
            project_name=project.name if project else None,
        ))
    
    return responses


@router.get("/projects/{project_id}", response_model=List[ActivityLogResponse])
async def get_project_activity_endpoint(
    project_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get activity for a specific project"""
    # Check access
    from ...services.project import get_project
    project = get_project(db, project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )
    
    if not project.is_public:
        if not check_project_permission(db, project_id, current_user.id, ProjectMemberRole.VIEWER.value):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied",
            )
    
    logs = get_project_activity(db, project_id, skip=skip, limit=limit)
    
    responses = []
    for log in logs:
        user = log.user
        project = log.project
        responses.append(ActivityLogResponse(
            **log.__dict__,
            username=user.username if user else None,
            full_name=user.full_name if user else None,
            avatar_url=user.avatar_url if user else None,
            project_name=project.name if project else None,
        ))
    
    return responses


@router.get("/{log_id}", response_model=ActivityLogResponse)
async def get_activity_log_endpoint(
    log_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific activity log"""
    log = get_activity_log(db, log_id)
    if not log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Activity log not found",
        )
    
    # Check access
    if log.user_id != current_user.id:
        from ...services.project import get_project
        project = get_project(db, log.project_id) if log.project_id else None
        if project:
            if not project.is_public:
                if not check_project_permission(db, project.id, current_user.id, ProjectMemberRole.VIEWER.value):
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Access denied",
                    )
    
    user = log.user
    project = log.project
    return ActivityLogResponse(
        **log.__dict__,
        username=user.username if user else None,
        full_name=user.full_name if user else None,
        avatar_url=user.avatar_url if user else None,
        project_name=project.name if project else None,
    )
