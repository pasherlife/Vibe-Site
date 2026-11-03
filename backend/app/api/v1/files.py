"""File management endpoints"""
import os
from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Form, BackgroundTasks
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pathlib import Path

from ...core.database import get_db
from ...core.config import settings
from ...models.user import User, UserRole
from ...models.project import ProjectMemberRole
from ...schemas.file import FileUploadResponse, FileResponse, FileVersionResponse, FileUpdate
from ...schemas.translation import TranslationStatsResponse
from ...services.file import (
    get_file,
    get_project_files,
    create_file,
    update_file,
    delete_file,
    save_uploaded_file,
    process_uploaded_file,
    create_file_version,
    get_file_versions,
    get_file_strings,
    search_file_strings,
)
from ...services.project import get_project, check_project_permission
from ...services.translation import get_translation_statistics
from ...services.activity import create_activity_log
from ...utils.security import get_current_user, has_role

router = APIRouter(prefix="/files", tags=["Files"])


@router.post("/upload", response_model=FileUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_file(
    project_id: str = Form(...),
    source_language: str = Form("en"),
    target_language: str = Form("uk"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    background_tasks: BackgroundTasks = BackgroundTasks(),
):
    """Upload a translation file"""
    # Check project exists
    project = get_project(db, project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )
    
    # Check permission
    if not check_project_permission(db, project_id, current_user.id, ProjectMemberRole.TRANSLATOR.value):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Translator access required to upload files",
        )
    
    # Validate file extension
    file_extension = Path(file.filename).suffix.lower()
    if file_extension not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed: {', '.join(settings.ALLOWED_EXTENSIONS)}",
        )
    
    # Check file size
    file_content = await file.read()
    if len(file_content) > settings.max_file_size_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size: {settings.MAX_FILE_SIZE_MB}MB",
        )
    
    # Save file
    file_path, file_type = save_uploaded_file(file_content, file.filename)
    
    # Create file record
    file_record = create_file(
        db=db,
        file_data={
            "filename": f"{Path(file.filename).stem}_{project_id}{file_extension}",
            "original_filename": file.filename,
            "file_type": file_type,
            "file_path": file_path,
            "file_size": len(file_content),
            "source_language": source_language,
            "target_language": target_language,
        },
        project_id=project_id,
        user_id=current_user.id,
    )
    
    # Process file in background
    background_tasks.add_task(process_uploaded_file, db, file_record)
    
    # Log activity
    create_activity_log(
        db=db,
        activity_type="file_uploaded",
        user_id=current_user.id,
        project_id=project_id,
        description=f"File '{file.filename}' uploaded to project '{project.name}'",
    )
    
    return FileUploadResponse(
        id=file_record.id,
        filename=file_record.filename,
        original_filename=file_record.original_filename,
        file_type=file_record.file_type,
        file_size=file_record.file_size,
        status=file_record.status,
        project_id=project_id,
        total_strings=file_record.total_strings,
    )


@router.get("/projects/{project_id}", response_model=List[FileResponse])
async def get_project_files_endpoint(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all files for a project"""
    project = get_project(db, project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )
    
    # Check access
    if not project.is_public:
        if not check_project_permission(db, project_id, current_user.id, ProjectMemberRole.VIEWER.value):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied",
            )
    
    files = get_project_files(db, project_id)
    
    responses = []
    for file in files:
        # Get uploader info
        uploader = file.uploaded_by
        responses.append(FileResponse(
            **file.__dict__,
            uploaded_by_username=uploader.username if uploader else None,
            uploaded_by_full_name=uploader.full_name if uploader else None,
        ))
    
    return responses


@router.get("/{file_id}", response_model=FileResponse)
async def get_file_by_id(
    file_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific file"""
    file = get_file(db, file_id)
    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found",
        )
    
    # Check access through project
    project = file.project
    if not project.is_public:
        if not check_project_permission(db, project.id, current_user.id, ProjectMemberRole.VIEWER.value):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied",
            )
    
    # Get uploader info
    uploader = file.uploaded_by
    return FileResponse(
        **file.__dict__,
        uploaded_by_username=uploader.username if uploader else None,
        uploaded_by_full_name=uploader.full_name if uploader else None,
    )


@router.put("/{file_id}", response_model=FileResponse)
async def update_file_endpoint(
    file_id: str,
    file_update: FileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update file metadata"""
    file = get_file(db, file_id)
    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found",
        )
    
    # Check permission
    if not check_project_permission(db, file.project_id, current_user.id, ProjectMemberRole.ADMIN.value):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required to update file metadata",
        )
    
    file = update_file(db, file_id, file_update)
    
    # Log activity
    create_activity_log(
        db=db,
        activity_type="file_updated",
        user_id=current_user.id,
        project_id=file.project_id,
        description=f"File '{file.filename}' metadata updated",
    )
    
    # Get uploader info
    uploader = file.uploaded_by
    return FileResponse(
        **file.__dict__,
        uploaded_by_username=uploader.username if uploader else None,
        uploaded_by_full_name=uploader.full_name if uploader else None,
    )


@router.delete("/{file_id}", response_model=FileResponse)
async def delete_file_endpoint(
    file_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a file"""
    file = get_file(db, file_id)
    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found",
        )
    
    # Check permission
    if not check_project_permission(db, file.project_id, current_user.id, ProjectMemberRole.ADMIN.value):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required to delete files",
        )
    
    project_id = file.project_id
    project_name = file.project.name
    filename = file.filename
    
    success = delete_file(db, file_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete file",
        )
    
    # Log activity
    create_activity_log(
        db=db,
        activity_type="file_deleted",
        user_id=current_user.id,
        project_id=project_id,
        description=f"File '{filename}' deleted from project '{project_name}'",
    )
    
    return FileResponse(
        **file.__dict__,
        uploaded_by_username=file.uploaded_by.username if file.uploaded_by else None,
    )


@router.get("/{file_id}/download")
async def download_file(
    file_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Download a file"""
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
    
    # Check if file exists
    file_path = Path(file.file_path)
    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found on server",
        )
    
    return FileResponse(
        path=file_path,
        filename=file.original_filename,
        media_type="application/octet-stream",
    )


@router.get("/{file_id}/versions", response_model=List[FileVersionResponse])
async def get_file_versions_endpoint(
    file_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all versions of a file"""
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
    
    versions = get_file_versions(db, file_id)
    return [FileVersionResponse.model_validate(version) for version in versions]


@router.get("/{file_id}/stats", response_model=TranslationStatsResponse)
async def get_file_stats(
    file_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get translation statistics for a file"""
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
    
    stats = get_translation_statistics(db, file_id)
    return TranslationStatsResponse(
        total_strings=file.total_strings,
        translated_strings=file.translated_strings,
        reviewed_strings=file.reviewed_strings,
        approved_strings=0,
        progress_percentage=stats["progress"],
        untranslated_count=stats["untranslated"],
        translated_count=stats["translated"],
        reviewed_count=stats["reviewed"],
        approved_count=stats["approved"],
        rejected_count=stats["rejected"],
    )


@router.get("/{file_id}/strings", response_model=List[any])
async def get_file_strings_endpoint(
    file_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
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
    
    if search:
        strings = search_file_strings(db, file_id, search, limit)
    elif status:
        strings = get_file_strings(db, file_id, skip=skip, limit=limit)
        strings = [s for s in strings if s.status == status]
    else:
        strings = get_file_strings(db, file_id, skip=skip, limit=limit)
    
    # Format response
    responses = []
    for string in strings:
        responses.append({
            "id": string.id,
            "key": string.key,
            "source_text": string.source_text,
            "target_text": string.target_text,
            "context": string.context,
            "notes": string.notes,
            "status": string.status,
            "is_locked": string.is_locked,
            "max_length": string.max_length,
            "created_at": string.created_at,
            "updated_at": string.updated_at,
        })
    
    return responses
