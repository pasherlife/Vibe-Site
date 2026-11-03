"""File service layer for handling translation files"""
import os
import uuid
import json
import csv
import re
from datetime import datetime
from typing import Optional, List, Dict, Any
from pathlib import Path
from sqlalchemy.orm import Session

from ..models.file import TranslationFile, FileVersion, FileStatus, FileType
from ..models.translation import TranslationString, TranslationStatus
from ..schemas.file import FileUploadResponse, FileUpdate
from ..core.config import settings
from .project import get_project, check_project_permission
from ..models.project import ProjectMemberRole


# Create upload directory if it doesn't exist
UPLOAD_DIR = Path(settings.UPLOAD_DIR)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def get_file(db: Session, file_id: str) -> Optional[TranslationFile]:
    """Get file by ID"""
    return db.query(TranslationFile).filter(TranslationFile.id == file_id).first()


def get_project_files(db: Session, project_id: str) -> List[TranslationFile]:
    """Get all files for a project"""
    return db.query(TranslationFile).filter(TranslationFile.project_id == project_id).all()


def create_file(db: Session, file_data: dict, project_id: str, user_id: str) -> TranslationFile:
    """Create a new translation file record"""
    file = TranslationFile(
        id=str(uuid.uuid4()),
        project_id=project_id,
        uploaded_by_id=user_id,
        filename=file_data.get("filename"),
        original_filename=file_data.get("original_filename"),
        file_type=file_data.get("file_type"),
        file_path=file_data.get("file_path"),
        file_size=file_data.get("file_size", 0),
        source_language=file_data.get("source_language", "en"),
        target_language=file_data.get("target_language", "uk"),
        status=FileStatus.PENDING.value,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(file)
    db.commit()
    db.refresh(file)
    return file


def update_file(db: Session, file_id: str, file_update: FileUpdate) -> Optional[TranslationFile]:
    """Update file metadata"""
    file = get_file(db, file_id)
    if not file:
        return None
    
    update_data = file_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(file, field, value)
    
    file.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(file)
    return file


def delete_file(db: Session, file_id: str) -> bool:
    """Delete a file"""
    file = get_file(db, file_id)
    if not file:
        return False
    
    # Delete the actual file
    try:
        file_path = Path(file.file_path)
        if file_path.exists():
            file_path.unlink()
    except Exception as e:
        print(f"Error deleting file: {e}")
    
    db.delete(file)
    db.commit()
    return True


def save_uploaded_file(file_content: bytes, filename: str) -> tuple[str, str]:
    """Save uploaded file to disk and return path and detected type"""
    # Generate unique filename
    file_id = str(uuid.uuid4())
    file_extension = Path(filename).suffix.lower()
    
    # Determine file type
    if file_extension == ".locres":
        file_type = FileType.LOCRES.value
    elif file_extension == ".csv":
        file_type = FileType.CSV.value
    elif file_extension == ".json":
        file_type = FileType.JSON.value
    elif file_extension == ".txt":
        file_type = FileType.TXT.value
    else:
        # Try to detect from content
        try:
            content_str = file_content.decode('utf-8', errors='ignore')
            if content_str.strip().startswith('{'):
                file_type = FileType.JSON.value
                file_extension = ".json"
            elif ';' in content_str and ',' in content_str:
                file_type = FileType.CSV.value
                file_extension = ".csv"
            else:
                file_type = FileType.TXT.value
                file_extension = ".txt"
        except:
            file_type = FileType.TXT.value
            file_extension = ".txt"
    
    # Save file
    file_path = UPLOAD_DIR / f"{file_id}{file_extension}"
    with open(file_path, "wb") as f:
        f.write(file_content)
    
    return str(file_path), file_type


async def parse_uploaded_file(file_path: str, file_type: str) -> tuple[List[Dict[str, Any]], Optional[str]]:
    """Parse uploaded file and extract translation strings"""
    try:
        if file_type == FileType.JSON.value:
            return await parse_json_file(file_path)
        elif file_type == FileType.CSV.value:
            return await parse_csv_file(file_path)
        elif file_type == FileType.LOCRES.value:
            return await parse_locres_file(file_path)
        elif file_type == FileType.TXT.value:
            return await parse_txt_file(file_path)
        else:
            return [], f"Unsupported file type: {file_type}"
    except Exception as e:
        return [], f"Error parsing file: {str(e)}"


async def parse_json_file(file_path: str) -> tuple[List[Dict[str, Any]], Optional[str]]:
    """Parse JSON localization file"""
    strings = []
    
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Handle different JSON structures
    if isinstance(data, dict):
        for key, value in data.items():
            if isinstance(value, str):
                strings.append({
                    "key": key,
                    "source_text": value,
                    "context": None,
                    "notes": None,
                })
            elif isinstance(value, dict):
                # Handle nested structure like {"key": {"text": "...", "context": "..."}}
                strings.append({
                    "key": key,
                    "source_text": value.get("text", value.get("value", "")),
                    "context": value.get("context", value.get("comment", None)),
                    "notes": value.get("notes", None),
                })
    elif isinstance(data, list):
        for item in data:
            if isinstance(item, dict):
                strings.append({
                    "key": item.get("key", item.get("id", str(len(strings)))),
                    "source_text": item.get("text", item.get("value", "")),
                    "context": item.get("context"),
                    "notes": item.get("notes", item.get("comment")),
                })
    
    return strings, None


async def parse_csv_file(file_path: str) -> tuple[List[Dict[str, Any]], Optional[str]]:
    """Parse CSV localization file"""
    strings = []
    
    with open(file_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        
        for row in reader:
            key = row.get('key', row.get('id', row.get('Key', row.get('ID', ''))))
            source_text = row.get('text', row.get('value', row.get('source', row.get('Text', row.get('Value', row.get('Source', ''))))))
            context = row.get('context', row.get('Context', None))
            notes = row.get('notes', row.get('comment', row.get('Notes', row.get('Comment', None))))
            
            if key and source_text:
                strings.append({
                    "key": key,
                    "source_text": source_text,
                    "context": context,
                    "notes": notes,
                })
    
    return strings, None


async def parse_locres_file(file_path: str) -> tuple[List[Dict[str, Any]], Optional[str]]:
    """Parse Unreal Engine .locres file"""
    strings = []
    
    try:
        import struct
        
        with open(file_path, 'rb') as f:
            # Read header
            header = f.read(4)
            if header != b'\xef\xbb\xbf\x00':
                # Try without BOM
                f.seek(0)
            
            # Locres files are typically JSON-like
            content = f.read().decode('utf-8', errors='ignore')
            
            # Try to parse as JSON
            try:
                data = json.loads(content)
                if isinstance(data, dict):
                    for key, value in data.items():
                        if isinstance(value, dict):
                            strings.append({
                                "key": key,
                                "source_text": value.get("Source", value.get("Text", "")),
                                "context": value.get("Context"),
                                "notes": value.get("Comment", value.get("Notes")),
                            })
            except:
                # Try line-by-line parsing
                for line in content.split('\n'):
                    line = line.strip()
                    if '=' in line and not line.startswith('//') and not line.startswith('#'):
                        parts = line.split('=', 1)
                        key = parts[0].strip()
                        value = parts[1].strip().strip('"').strip("'")
                        if key and value:
                            strings.append({
                                "key": key,
                                "source_text": value,
                                "context": None,
                                "notes": None,
                            })
    except ImportError:
        # Fallback to text parsing
        return await parse_txt_file(file_path)
    
    return strings, None


async def parse_txt_file(file_path: str) -> tuple[List[Dict[str, Any]], Optional[str]]:
    """Parse plain text file (key=value format)"""
    strings = []
    
    with open(file_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if '=' in line and not line.startswith('#') and not line.startswith('//'):
                parts = line.split('=', 1)
                key = parts[0].strip()
                value = parts[1].strip()
                if key and value:
                    strings.append({
                        "key": key,
                        "source_text": value,
                        "context": None,
                        "notes": None,
                    })
    
    return strings, None


async def process_uploaded_file(db: Session, file: TranslationFile) -> tuple[int, Optional[str]]:
    """Process uploaded file and extract translation strings"""
    try:
        # Parse the file
        strings_data, error = await parse_uploaded_file(file.file_path, file.file_type)
        
        if error:
            file.status = FileStatus.ERROR.value
            file.error_message = error
            db.commit()
            return 0, error
        
        # Create translation strings
        count = 0
        for string_data in strings_data:
            translation_string = TranslationString(
                id=str(uuid.uuid4()),
                file_id=file.id,
                key=string_data.get("key", f"string_{count}"),
                source_text=string_data.get("source_text", ""),
                target_text=None,
                context=string_data.get("context"),
                notes=string_data.get("notes"),
                status=TranslationStatus.UNTRANSLATED.value,
                is_locked=False,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )
            db.add(translation_string)
            count += 1
        
        # Update file statistics
        file.total_strings = count
        file.translated_strings = 0
        file.reviewed_strings = 0
        file.status = FileStatus.READY.value
        file.error_message = None
        
        db.commit()
        db.refresh(file)
        
        return count, None
        
    except Exception as e:
        file.status = FileStatus.ERROR.value
        file.error_message = str(e)
        db.commit()
        return 0, str(e)


def create_file_version(db: Session, file_id: str, user_id: str, changelog: Optional[str] = None) -> FileVersion:
    """Create a new version of a file"""
    file = get_file(db, file_id)
    if not file:
        raise ValueError("File not found")
    
    # Get current version number
    versions = db.query(FileVersion).filter(FileVersion.file_id == file_id).order_by(
        FileVersion.version_number.desc()
    ).all()
    version_number = versions[0].version_number + 1 if versions else 1
    
    # Create version
    version = FileVersion(
        id=str(uuid.uuid4()),
        file_id=file_id,
        version_number=version_number,
        filename=file.filename,
        file_path=file.file_path,
        file_size=file.file_size,
        changelog=changelog,
        created_at=datetime.utcnow(),
    )
    
    db.add(version)
    db.commit()
    db.refresh(version)
    return version


def get_file_versions(db: Session, file_id: str) -> List[FileVersion]:
    """Get all versions of a file"""
    return db.query(FileVersion).filter(FileVersion.file_id == file_id).order_by(
        FileVersion.version_number.desc()
    ).all()


def get_file_strings(db: Session, file_id: str, skip: int = 0, limit: int = 100) -> List[TranslationString]:
    """Get translation strings for a file"""
    return db.query(TranslationString).filter(
        TranslationString.file_id == file_id
    ).offset(skip).limit(limit).all()


def search_file_strings(db: Session, file_id: str, query: str, limit: int = 50) -> List[TranslationString]:
    """Search translation strings in a file"""
    return db.query(TranslationString).filter(
        TranslationString.file_id == file_id,
        or_(
            TranslationString.key.ilike(f"%{query}%"),
            TranslationString.source_text.ilike(f"%{query}%"),
            TranslationString.target_text.ilike(f"%{query}%"),
        )
    ).limit(limit).all()
