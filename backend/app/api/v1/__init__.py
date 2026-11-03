"""API v1 endpoints"""
from fastapi import APIRouter

router = APIRouter(prefix="/api/v1")

# Import and include sub-routers
from . import auth, users, projects, files, translations, activity

router.include_router(auth.router, tags=["Authentication"])
router.include_router(users.router, tags=["Users"])
router.include_router(projects.router, tags=["Projects"])
router.include_router(files.router, tags=["Files"])
router.include_router(translations.router, tags=["Translations"])
router.include_router(activity.router, tags=["Activity"])
