"""User service layer"""
import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from ..models.user import User, UserRole
from ..schemas.user import UserCreate, UserUpdate
from ..utils.security import get_password_hash

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_user(db: Session, user_id: str) -> Optional[User]:
    """Get user by ID"""
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_username(db: Session, username: str) -> Optional[User]:
    """Get user by username"""
    return db.query(User).filter(User.username == username).first()


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Get user by email"""
    return db.query(User).filter(User.email == email).first()


def get_users(db: Session, skip: int = 0, limit: int = 100) -> list[User]:
    """Get list of users"""
    return db.query(User).offset(skip).limit(limit).all()


def create_user(db: Session, username: str, email: str, password: str, **kwargs) -> User:
    """Create a new user"""
    hashed_password = get_password_hash(password)
    
    user_data = {
        "id": str(uuid.uuid4()),
        "username": username,
        "email": email,
        "hashed_password": hashed_password,
        "role": kwargs.get("role", UserRole.USER.value),
        "is_active": kwargs.get("is_active", True),
        "is_verified": kwargs.get("is_verified", False),
        "full_name": kwargs.get("full_name"),
        "created_at": datetime.utcnow(),
    }
    
    user = User(**user_data)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def update_user(db: Session, user_id: str, user_update: UserUpdate) -> Optional[User]:
    """Update user information"""
    user = get_user(db, user_id)
    if not user:
        return None
    
    update_data = user_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    
    user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(user)
    return user


def delete_user(db: Session, user_id: str) -> bool:
    """Delete a user"""
    user = get_user(db, user_id)
    if not user:
        return False
    
    db.delete(user)
    db.commit()
    return True


def change_password(db: Session, user_id: str, old_password: str, new_password: str) -> bool:
    """Change user password"""
    user = get_user(db, user_id)
    if not user:
        return False
    
    if not verify_password(old_password, user.hashed_password):
        return False
    
    user.hashed_password = get_password_hash(new_password)
    user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(user)
    return True


def search_users(db: Session, query: str, limit: int = 10) -> list[User]:
    """Search users by username or email"""
    return db.query(User).filter(
        User.username.ilike(f"%{query}%") | User.email.ilike(f"%{query}%")
    ).limit(limit).all()


# Import verify_password for use in auth
from ..utils.security import verify_password
