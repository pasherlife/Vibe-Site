"""Project management endpoints"""
from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from ...core.database import get_db
from ...models.user import User, UserRole
from ...models.project import Project, ProjectMemberRole
from ...schemas.project import (
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse,
    ProjectMemberResponse,
    ProjectMemberCreate,
    MessageResponse,
)
from ...services.project import (
    get_project,
    get_user_projects,
    get_public_projects,
    create_project,
    update_project,
    delete_project,
    get_project_members,
    get_project_member,
    create_project_member,
    update_project_member,
    remove_project_member,
    check_project_access,
    check_project_permission,
    search_projects,
)
from ...services.activity import create_activity_log
from ...utils.security import get_current_user, has_role

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.get("/my", response_model=List[ProjectResponse])
async def get_my_projects(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get projects where current user is owner or member"""
    projects = get_user_projects(db, current_user.id, skip=skip, limit=limit)
    
    # Add computed fields
    responses = []
    for project in projects:
        members_count = len(project.members)
        files_count = len(project.files)
        
        # Calculate total strings
        strings_count = sum(f.total_strings for f in project.files)
        
        # Calculate progress
        translated_strings = sum(f.translated_strings for f in project.files)
        progress = (translated_strings / strings_count * 100) if strings_count > 0 else 0.0
        
        responses.append(ProjectResponse(
            **project.__dict__,
            members_count=members_count,
            files_count=files_count,
            strings_count=strings_count,
            progress=round(progress, 2),
        ))
    
    return responses


@router.get("/public", response_model=List[ProjectResponse])
async def get_public_projects_endpoint(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
):
    """Get all public projects"""
    projects = get_public_projects(db, skip=skip, limit=limit)
    
    responses = []
    for project in projects:
        responses.append(ProjectResponse(
            **project.__dict__,
            members_count=len(project.members),
            files_count=len(project.files),
            strings_count=sum(f.total_strings for f in project.files),
            progress=0.0,
        ))
    
    return responses


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project_by_id(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific project"""
    project = get_project(db, project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )
    
    # Check access if project is not public
    if not project.is_public:
        member = check_project_access(db, project_id, current_user.id)
        if not member and not has_role(current_user, UserRole.ADMIN.value):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied",
            )
    
    # Calculate statistics
    members_count = len(project.members)
    files_count = len(project.files)
    strings_count = sum(f.total_strings for f in project.files)
    translated_strings = sum(f.translated_strings for f in project.files)
    progress = (translated_strings / strings_count * 100) if strings_count > 0 else 0.0
    
    return ProjectResponse(
        **project.__dict__,
        members_count=members_count,
        files_count=files_count,
        strings_count=strings_count,
        progress=round(progress, 2),
    )


@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_new_project(
    project_create: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new project"""
    project = create_project(db, project_create, current_user.id)
    
    # Log activity
    create_activity_log(
        db=db,
        activity_type="project_created",
        user_id=current_user.id,
        project_id=project.id,
        description=f"Project '{project.name}' created",
    )
    
    return ProjectResponse(
        **project.__dict__,
        members_count=1,
        files_count=0,
        strings_count=0,
        progress=0.0,
    )


@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project_endpoint(
    project_id: str,
    project_update: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a project"""
    project = get_project(db, project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )
    
    # Check permission
    if not check_project_permission(db, project_id, current_user.id, ProjectMemberRole.ADMIN.value):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required for this project",
        )
    
    project = update_project(db, project_id, project_update)
    
    # Log activity
    create_activity_log(
        db=db,
        activity_type="project_updated",
        user_id=current_user.id,
        project_id=project.id,
        description=f"Project '{project.name}' updated",
    )
    
    return ProjectResponse(
        **project.__dict__,
        members_count=len(project.members),
        files_count=len(project.files),
        strings_count=sum(f.total_strings for f in project.files),
        progress=0.0,
    )


@router.delete("/{project_id}", response_model=MessageResponse)
async def delete_project_endpoint(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a project"""
    project = get_project(db, project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )
    
    # Check permission
    if not check_project_permission(db, project_id, current_user.id, ProjectMemberRole.OWNER.value):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Owner access required to delete project",
        )
    
    success = delete_project(db, project_id)
    
    # Log activity
    create_activity_log(
        db=db,
        activity_type="project_deleted",
        user_id=current_user.id,
        project_id=project_id,
        description=f"Project '{project.name}' deleted",
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete project",
        )
    
    return MessageResponse(message="Project deleted successfully")


@router.get("/{project_id}/members", response_model=List[ProjectMemberResponse])
async def get_project_members_endpoint(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all members of a project"""
    project = get_project(db, project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )
    
    # Check access
    if not project.is_public:
        member = check_project_access(db, project_id, current_user.id)
        if not member and not has_role(current_user, UserRole.ADMIN.value):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied",
            )
    
    members = get_project_members(db, project_id)
    
    responses = []
    for member in members:
        # Get user info
        user = member.user
        responses.append(ProjectMemberResponse(
            **member.__dict__,
            username=user.username,
            email=user.email,
            full_name=user.full_name,
            avatar_url=user.avatar_url,
        ))
    
    return responses


@router.post("/{project_id}/members", response_model=ProjectMemberResponse, status_code=status.HTTP_201_CREATED)
async def add_project_member(
    member_create: ProjectMemberCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Add a member to a project"""
    project = get_project(db, project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )
    
    # Check permission
    if not check_project_permission(db, project_id, current_user.id, ProjectMemberRole.ADMIN.value):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required to add members",
        )
    
    member = create_project_member(db, member_create, project_id)
    
    # Log activity
    create_activity_log(
        db=db,
        activity_type="project_member_joined",
        user_id=current_user.id,
        project_id=project_id,
        description=f"User {member_create.user_id} added to project '{project.name}' as {member_create.role}",
    )
    
    # Get user info
    user = member.user
    return ProjectMemberResponse(
        **member.__dict__,
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        avatar_url=user.avatar_url,
    )


@router.put("/{project_id}/members/{user_id}", response_model=ProjectMemberResponse)
async def update_project_member_endpoint(
    project_id: str,
    user_id: str,
    role: str = Query(..., description="New role"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a project member's role"""
    project = get_project(db, project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )
    
    # Check permission
    if not check_project_permission(db, project_id, current_user.id, ProjectMemberRole.OWNER.value):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Owner access required to change member roles",
        )
    
    member = update_project_member(db, project_id, user_id, role)
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found",
        )
    
    # Log activity
    create_activity_log(
        db=db,
        activity_type="project_member_role_changed",
        user_id=current_user.id,
        project_id=project_id,
        description=f"User {user_id} role changed to {role} in project '{project.name}'",
    )
    
    # Get user info
    user = member.user
    return ProjectMemberResponse(
        **member.__dict__,
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        avatar_url=user.avatar_url,
    )


@router.delete("/{project_id}/members/{user_id}", response_model=MessageResponse)
async def remove_project_member_endpoint(
    project_id: str,
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Remove a member from a project"""
    project = get_project(db, project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )
    
    # Check permission
    if not check_project_permission(db, project_id, current_user.id, ProjectMemberRole.OWNER.value):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Owner access required to remove members",
        )
    
    # Cannot remove owner
    if user_id == project.owner_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot remove project owner",
        )
    
    success = remove_project_member(db, project_id, user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found",
        )
    
    # Log activity
    create_activity_log(
        db=db,
        activity_type="project_member_left",
        user_id=current_user.id,
        project_id=project_id,
        description=f"User {user_id} removed from project '{project.name}'",
    )
    
    return MessageResponse(message="Member removed successfully")


@router.get("/search", response_model=List[ProjectResponse])
async def search_projects_endpoint(
    query: str = Query(..., min_length=2),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Search projects by name or description"""
    projects = search_projects(db, query, limit)
    
    # Filter by access if not admin
    if not has_role(current_user, UserRole.ADMIN.value):
        accessible_projects = []
        for project in projects:
            if project.is_public:
                accessible_projects.append(project)
            else:
                member = check_project_access(db, project.id, current_user.id)
                if member:
                    accessible_projects.append(project)
        projects = accessible_projects
    
    responses = []
    for project in projects:
        responses.append(ProjectResponse(
            **project.__dict__,
            members_count=len(project.members),
            files_count=len(project.files),
            strings_count=sum(f.total_strings for f in project.files),
            progress=0.0,
        ))
    
    return responses
