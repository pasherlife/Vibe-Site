"""User management endpoints"""
from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from ...core.database import get_db
from ...models.user import User, UserRole
from ...schemas.user import (
    UserCreate,
    UserUpdate,
    UserResponse,
    UserProfileResponse,
    MessageResponse,
)
from ...services.user import (
    get_user,
    get_users,
    create_user,
    update_user,
    delete_user,
    search_users,
)
from ...utils.security import get_current_user, has_role

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserProfileResponse)
async def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get current user profile with statistics"""
    # Get user projects count
    projects_owned = len(current_user.projects_owned)
    projects_member = len(current_user.project_memberships)
    translations_count = len(current_user.uploaded_files)
    suggestions_count = len(current_user.translation_suggestions)
    
    return UserProfileResponse(
        **UserResponse.model_validate(current_user).model_dump(),
        bio=current_user.bio,
        projects_owned_count=projects_owned,
        projects_member_count=projects_member,
        translations_count=translations_count,
        suggestions_count=suggestions_count,
    )


@router.get("/{user_id}", response_model=UserResponse)
async def get_user_by_id(
    user_id: str,
    db: Session = Depends(get_db),
):
    """Get user by ID"""
    user = get_user(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return UserResponse.model_validate(user)


@router.get("/", response_model=List[UserResponse])
async def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all users (admin only)"""
    if not has_role(current_user, UserRole.ADMIN.value):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    
    users = get_users(db, skip=skip, limit=limit)
    return [UserResponse.model_validate(user) for user in users]


@router.put("/me", response_model=UserResponse)
async def update_my_profile(
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update current user profile"""
    user = update_user(db, current_user.id, user_update)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return UserResponse.model_validate(user)


@router.put("/{user_id}", response_model=UserResponse)
async def update_user_profile(
    user_id: str,
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update user profile (admin only)"""
    if not has_role(current_user, UserRole.ADMIN.value):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    
    user = update_user(db, user_id, user_update)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return UserResponse.model_validate(user)


@router.delete("/{user_id}", response_model=MessageResponse)
async def delete_user_profile(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a user (admin only)"""
    if not has_role(current_user, UserRole.ADMIN.value):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    
    success = delete_user(db, user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return MessageResponse(message="User deleted successfully")


@router.get("/search", response_model=List[UserResponse])
async def search_users_endpoint(
    query: str = Query(..., min_length=2),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Search users by username or email"""
    users = search_users(db, query, limit)
    return [UserResponse.model_validate(user) for user in users]
