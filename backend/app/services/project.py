"""Project service layer"""
import uuid
from datetime import datetime
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_

from ..models.project import Project, ProjectMember, ProjectMemberRole
from ..models.user import User
from ..schemas.project import ProjectCreate, ProjectUpdate, ProjectMemberCreate


def get_project(db: Session, project_id: str) -> Optional[Project]:
    """Get project by ID"""
    return db.query(Project).filter(Project.id == project_id).first()


def get_project_by_name(db: Session, name: str) -> Optional[Project]:
    """Get project by name"""
    return db.query(Project).filter(Project.name == name).first()


def get_user_projects(db: Session, user_id: str, skip: int = 0, limit: int = 100) -> List[Project]:
    """Get projects where user is owner or member"""
    # Get projects owned by user
    owned_projects = db.query(Project).filter(Project.owner_id == user_id)
    
    # Get projects where user is a member
    member_projects = db.query(Project).join(
        ProjectMember, ProjectMember.project_id == Project.id
    ).filter(ProjectMember.user_id == user_id)
    
    # Combine and deduplicate
    all_projects = owned_projects.union(member_projects).offset(skip).limit(limit).all()
    return all_projects


def get_public_projects(db: Session, skip: int = 0, limit: int = 100) -> List[Project]:
    """Get public projects"""
    return db.query(Project).filter(Project.is_public == True).offset(skip).limit(limit).all()


def create_project(db: Session, project_create: ProjectCreate, owner_id: str) -> Project:
    """Create a new project"""
    project_data = {
        "id": str(uuid.uuid4()),
        "name": project_create.name,
        "description": project_create.description,
        "icon_url": project_create.icon_url,
        "owner_id": owner_id,
        "is_public": project_create.is_public,
        "allow_join_requests": project_create.allow_join_requests,
        "default_language": project_create.default_language,
        "target_languages": project_create.target_languages,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }
    
    project = Project(**project_data)
    db.add(project)
    db.commit()
    db.refresh(project)
    
    # Add owner as member
    create_project_member(db, ProjectMemberCreate(
        user_id=owner_id,
        role=ProjectMemberRole.OWNER.value
    ), project.id)
    
    return project


def update_project(db: Session, project_id: str, project_update: ProjectUpdate) -> Optional[Project]:
    """Update project information"""
    project = get_project(db, project_id)
    if not project:
        return None
    
    update_data = project_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)
    
    project.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(project)
    return project


def delete_project(db: Session, project_id: str) -> bool:
    """Delete a project"""
    project = get_project(db, project_id)
    if not project:
        return False
    
    db.delete(project)
    db.commit()
    return True


def get_project_members(db: Session, project_id: str) -> List[ProjectMember]:
    """Get all members of a project"""
    return db.query(ProjectMember).filter(ProjectMember.project_id == project_id).all()


def get_project_member(db: Session, project_id: str, user_id: str) -> Optional[ProjectMember]:
    """Get a specific project member"""
    return db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == user_id
    ).first()


def create_project_member(db: Session, member_create: ProjectMemberCreate, project_id: str) -> ProjectMember:
    """Add a member to a project"""
    # Check if user exists
    user = db.query(User).filter(User.id == member_create.user_id).first()
    if not user:
        raise ValueError("User not found")
    
    # Check if already a member
    existing = get_project_member(db, project_id, member_create.user_id)
    if existing:
        raise ValueError("User is already a member of this project")
    
    member_data = {
        "id": str(uuid.uuid4()),
        "project_id": project_id,
        "user_id": member_create.user_id,
        "role": member_create.role,
        "joined_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }
    
    member = ProjectMember(**member_data)
    db.add(member)
    db.commit()
    db.refresh(member)
    return member


def update_project_member(db: Session, project_id: str, user_id: str, role: str) -> Optional[ProjectMember]:
    """Update project member role"""
    member = get_project_member(db, project_id, user_id)
    if not member:
        return None
    
    member.role = role
    member.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(member)
    return member


def remove_project_member(db: Session, project_id: str, user_id: str) -> bool:
    """Remove a member from a project"""
    member = get_project_member(db, project_id, user_id)
    if not member:
        return False
    
    db.delete(member)
    db.commit()
    return True


def check_project_access(db: Session, project_id: str, user_id: str) -> Optional[ProjectMember]:
    """Check if user has access to a project"""
    # Check if user is owner
    project = get_project(db, project_id)
    if project and project.owner_id == user_id:
        return ProjectMember(
            id="",
            project_id=project_id,
            user_id=user_id,
            role=ProjectMemberRole.OWNER.value,
        )
    
    # Check if user is a member
    return get_project_member(db, project_id, user_id)


def check_project_permission(db: Session, project_id: str, user_id: str, required_role: str) -> bool:
    """Check if user has required permission level"""
    member = check_project_access(db, project_id, user_id)
    if not member:
        return False
    
    # Role hierarchy
    role_hierarchy = {
        ProjectMemberRole.OWNER.value: 5,
        ProjectMemberRole.ADMIN.value: 4,
        ProjectMemberRole.REVIEWER.value: 3,
        ProjectMemberRole.TRANSLATOR.value: 2,
        ProjectMemberRole.VIEWER.value: 1,
    }
    
    member_level = role_hierarchy.get(member.role, 0)
    required_level = role_hierarchy.get(required_role, 0)
    
    return member_level >= required_level


def search_projects(db: Session, query: str, limit: int = 10) -> List[Project]:
    """Search projects by name or description"""
    return db.query(Project).filter(
        or_(
            Project.name.ilike(f"%{query}%"),
            Project.description.ilike(f"%{query}%")
        )
    ).limit(limit).all()
