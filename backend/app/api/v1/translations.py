"""Translation management endpoints"""
from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from ...core.database import get_db
from ...models.user import User, UserRole
from ...models.project import ProjectMemberRole
from ...schemas.translation import (
    TranslationStringResponse,
    TranslationStringUpdate,
    TranslationSuggestionCreate,
    TranslationSuggestionResponse,
    TranslationCommentCreate,
    TranslationCommentResponse,
    TranslationStatsResponse,
)
from ...services.translation import (
    get_translation_string,
    update_translation_string,
    get_translation_strings_by_file,
    create_translation_suggestion,
    get_translation_suggestions,
    get_translation_suggestion,
    update_translation_suggestion_status,
    delete_translation_suggestion,
    create_translation_comment,
    get_translation_comments,
    get_translation_comment,
    update_translation_comment,
    delete_translation_comment,
    get_translation_statistics,
    lock_translation_string,
    unlock_translation_string,
    search_translations,
)
from ...services.file import get_file
from ...services.project import check_project_permission
from ...services.activity import create_activity_log
from ...utils.security import get_current_user

router = APIRouter(prefix="/translations", tags=["Translations"])


@router.get("/strings/{string_id}", response_model=TranslationStringResponse)
async def get_string(
    string_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a translation string"""
    string = get_translation_string(db, string_id)
    if not string:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Translation string not found",
        )
    
    # Check access through file
    file = get_file(db, string.file_id)
    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found",
        )
    
    project = file.project
    if not project.is_public:
        if not check_project_permission(db, project.id, current_user.id, ProjectMemberRole.VIEWER.value):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied",
            )
    
    return TranslationStringResponse(
        **string.__dict__,
        filename=file.filename,
        file_type=file.file_type,
    )


@router.put("/strings/{string_id}", response_model=TranslationStringResponse)
async def update_string(
    string_id: str,
    string_update: TranslationStringUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a translation string"""
    string = get_translation_string(db, string_id)
    if not string:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Translation string not found",
        )
    
    # Check access through file
    file = get_file(db, string.file_id)
    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found",
        )
    
    project = file.project
    if not check_project_permission(db, project.id, current_user.id, ProjectMemberRole.TRANSLATOR.value):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Translator access required",
        )
    
    # Check if string is locked
    if string.is_locked:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Translation string is locked",
        )
    
    old_status = string.status
    string = update_translation_string(db, string_id, string_update, current_user.id)
    
    # Log activity
    if string_update.status and string_update.status != old_status:
        create_activity_log(
            db=db,
            activity_type="translation_status_changed",
            user_id=current_user.id,
            project_id=project.id,
            description=f"Translation string '{string.key}' status changed from {old_status} to {string.status}",
        )
    
    return TranslationStringResponse(
        **string.__dict__,
        filename=file.filename,
        file_type=file.file_type,
    )


@router.get("/files/{file_id}/strings", response_model=List[TranslationStringResponse])
async def get_file_strings(
    file_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status_filter: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get translation strings for a file"""
    file = get_file(db, file_id)
    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found",
        )
    
    # Check access
    project = file.project
    if not project.is_public:
        if not check_project_permission(db, project.id, current_user.id, ProjectMemberRole.VIEWER.value):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied",
            )
    
    strings = get_translation_strings_by_file(db, file_id, status_filter, skip, limit)
    
    responses = []
    for string in strings:
        responses.append(TranslationStringResponse(
            **string.__dict__,
            filename=file.filename,
            file_type=file.file_type,
        ))
    
    return responses


@router.post("/suggestions", response_model=TranslationSuggestionResponse, status_code=status.HTTP_201_CREATED)
async def create_suggestion(
    suggestion_data: TranslationSuggestionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a translation suggestion"""
    string = get_translation_string(db, suggestion_data.translation_string_id)
    if not string:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Translation string not found",
        )
    
    # Check access through file
    file = get_file(db, string.file_id)
    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found",
        )
    
    project = file.project
    if not check_project_permission(db, project.id, current_user.id, ProjectMemberRole.TRANSLATOR.value):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Translator access required",
        )
    
    suggestion = create_translation_suggestion(db, suggestion_data, current_user.id)
    
    # Log activity
    create_activity_log(
        db=db,
        activity_type="translation_suggestion_added",
        user_id=current_user.id,
        project_id=project.id,
        description=f"Suggestion added for string '{string.key}'",
    )
    
    return TranslationSuggestionResponse(
        **suggestion.__dict__,
        username=current_user.username,
        full_name=current_user.full_name,
    )


@router.get("/strings/{string_id}/suggestions", response_model=List[TranslationSuggestionResponse])
async def get_string_suggestions(
    string_id: str,
    status_filter: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get suggestions for a translation string"""
    string = get_translation_string(db, string_id)
    if not string:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Translation string not found",
        )
    
    # Check access through file
    file = get_file(db, string.file_id)
    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found",
        )
    
    project = file.project
    if not project.is_public:
        if not check_project_permission(db, project.id, current_user.id, ProjectMemberRole.VIEWER.value):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied",
            )
    
    suggestions = get_translation_suggestions(db, string_id, status_filter)
    
    responses = []
    for suggestion in suggestions:
        user = suggestion.user
        responses.append(TranslationSuggestionResponse(
            **suggestion.__dict__,
            username=user.username if user else None,
            full_name=user.full_name if user else None,
        ))
    
    return responses


@router.put("/suggestions/{suggestion_id}/status", response_model=TranslationSuggestionResponse)
async def update_suggestion_status(
    suggestion_id: str,
    status: str = Query(..., description="New status (accepted/rejected)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update suggestion status"""
    suggestion = get_translation_suggestion(db, suggestion_id)
    if not suggestion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Suggestion not found",
        )
    
    # Check access through string
    string = get_translation_string(db, suggestion.translation_string_id)
    if not string:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Translation string not found",
        )
    
    file = get_file(db, string.file_id)
    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found",
        )
    
    project = file.project
    if not check_project_permission(db, project.id, current_user.id, ProjectMemberRole.REVIEWER.value):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Reviewer access required",
        )
    
    suggestion = update_translation_suggestion_status(db, suggestion_id, status, current_user.id)
    
    # Log activity
    create_activity_log(
        db=db,
        activity_type="translation_suggestion_accepted" if status == "accepted" else "translation_suggestion_rejected",
        user_id=current_user.id,
        project_id=project.id,
        description=f"Suggestion for string '{string.key}' {status}",
    )
    
    user = suggestion.user
    return TranslationSuggestionResponse(
        **suggestion.__dict__,
        username=user.username if user else None,
        full_name=user.full_name if user else None,
    )


@router.post("/comments", response_model=TranslationCommentResponse, status_code=status.HTTP_201_CREATED)
async def create_comment(
    comment_data: TranslationCommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a translation comment"""
    string = get_translation_string(db, comment_data.translation_string_id)
    if not string:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Translation string not found",
        )
    
    # Check access through file
    file = get_file(db, string.file_id)
    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found",
        )
    
    project = file.project
    if not check_project_permission(db, project.id, current_user.id, ProjectMemberRole.VIEWER.value):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )
    
    comment = create_translation_comment(db, comment_data, current_user.id)
    
    # Log activity
    create_activity_log(
        db=db,
        activity_type="translation_comment_added",
        user_id=current_user.id,
        project_id=project.id,
        description=f"Comment added to string '{string.key}'",
    )
    
    return TranslationCommentResponse(
        **comment.__dict__,
        username=current_user.username,
        full_name=current_user.full_name,
        avatar_url=current_user.avatar_url,
    )


@router.get("/strings/{string_id}/comments", response_model=List[TranslationCommentResponse])
async def get_string_comments(
    string_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get comments for a translation string"""
    string = get_translation_string(db, string_id)
    if not string:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Translation string not found",
        )
    
    # Check access through file
    file = get_file(db, string.file_id)
    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found",
        )
    
    project = file.project
    if not project.is_public:
        if not check_project_permission(db, project.id, current_user.id, ProjectMemberRole.VIEWER.value):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied",
            )
    
    comments = get_translation_comments(db, string_id)
    
    # Build comment tree
    comment_map = {}
    for comment in comments:
        user = comment.user
        comment_response = TranslationCommentResponse(
            **comment.__dict__,
            username=user.username if user else None,
            full_name=user.full_name if user else None,
            avatar_url=user.avatar_url if user else None,
        )
        comment_map[comment.id] = comment_response
    
    # Add replies
    for comment in comments:
        if comment.parent_id and comment.parent_id in comment_map:
            parent = comment_map[comment.parent_id]
            user = comment.user
            parent.replies.append(TranslationCommentResponse(
                **comment.__dict__,
                username=user.username if user else None,
                full_name=user.full_name if user else None,
                avatar_url=user.avatar_url if user else None,
            ))
    
    # Return top-level comments
    return [comment_map[c.id] for c in comments if c.parent_id is None]


@router.put("/comments/{comment_id}", response_model=TranslationCommentResponse)
async def update_comment(
    comment_id: str,
    content: str = Query(..., description="Updated comment content"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a translation comment"""
    comment = get_translation_comment(db, comment_id)
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found",
        )
    
    # Check ownership
    if comment.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Can only edit your own comments",
        )
    
    comment = update_translation_comment(db, comment_id, content, current_user.id)
    
    user = comment.user
    return TranslationCommentResponse(
        **comment.__dict__,
        username=user.username,
        full_name=user.full_name,
        avatar_url=user.avatar_url,
    )


@router.delete("/comments/{comment_id}", response_model=TranslationCommentResponse)
async def delete_comment(
    comment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a translation comment"""
    comment = get_translation_comment(db, comment_id)
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found",
        )
    
    # Check ownership
    if comment.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Can only delete your own comments",
        )
    
    success = delete_translation_comment(db, comment_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete comment",
        )
    
    user = comment.user
    return TranslationCommentResponse(
        **comment.__dict__,
        username=user.username,
        full_name=user.full_name,
        avatar_url=user.avatar_url,
    )


@router.get("/search", response_model=List[TranslationStringResponse])
async def search_translations_endpoint(
    query: str = Query(..., min_length=2),
    project_id: Optional[str] = Query(None),
    file_id: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Search translations"""
    # Check access if project_id is specified
    if project_id:
        from ...services.project import get_project, check_project_access
        project = get_project(db, project_id)
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found",
            )
        if not project.is_public:
            if not check_project_access(db, project_id, current_user.id):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied",
                )
    
    strings = search_translations(db, project_id, file_id, query, status_filter, limit)
    
    responses = []
    for string in strings:
        file = get_file(db, string.file_id)
        if file:
            responses.append(TranslationStringResponse(
                **string.__dict__,
                filename=file.filename,
                file_type=file.file_type,
            ))
    
    return responses


@router.post("/strings/{string_id}/lock", response_model=TranslationStringResponse)
async def lock_string(
    string_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Lock a translation string"""
    string = get_translation_string(db, string_id)
    if not string:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Translation string not found",
        )
    
    # Check access through file
    file = get_file(db, string.file_id)
    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found",
        )
    
    project = file.project
    if not check_project_permission(db, project.id, current_user.id, ProjectMemberRole.ADMIN.value):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    
    string = lock_translation_string(db, string_id, current_user.id)
    
    return TranslationStringResponse(
        **string.__dict__,
        filename=file.filename,
        file_type=file.file_type,
    )


@router.post("/strings/{string_id}/unlock", response_model=TranslationStringResponse)
async def unlock_string(
    string_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Unlock a translation string"""
    string = get_translation_string(db, string_id)
    if not string:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Translation string not found",
        )
    
    # Check access through file
    file = get_file(db, string.file_id)
    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found",
        )
    
    project = file.project
    if not check_project_permission(db, project.id, current_user.id, ProjectMemberRole.ADMIN.value):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    
    string = unlock_translation_string(db, string_id, current_user.id)
    
    return TranslationStringResponse(
        **string.__dict__,
        filename=file.filename,
        file_type=file.file_type,
    )
