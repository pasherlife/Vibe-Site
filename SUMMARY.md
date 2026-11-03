# 📋 Game Localization Portal - Project Summary

## 🎯 Project Overview

**Game Localization Portal** - це повнофункціональний веб-застосунок для управління локалізацією ігор. Він надає зручний інтерфейс для завантаження, перекладу та керування файлами локалізації у команді.

## ✨ Key Features

### 🔐 Authentication & Users
- ✅ User registration and login
- ✅ JWT token-based authentication
- ✅ User profiles with avatars
- ✅ User roles (admin, translator, reviewer, user)
- ✅ Profile management

### 📁 Projects & Teams
- ✅ Create, update, delete projects
- ✅ Public and private projects
- ✅ Team collaboration
- ✅ Role-based permissions (owner, admin, translator, reviewer, viewer)
- ✅ Project members management
- ✅ Join requests (for public projects)

### 📄 File Management
- ✅ Upload files (locres, CSV, JSON, TXT)
- ✅ Automatic file parsing
- ✅ File versioning
- ✅ File metadata management
- ✅ Download files
- ✅ File statistics

### 🌍 Translation System
- ✅ Translation string management
- ✅ Status tracking (untranslated, translated, reviewed, approved, rejected)
- ✅ Translation suggestions
- ✅ Accept/reject suggestions
- ✅ Comments on translations
- ✅ Threaded comments
- ✅ String locking
- ✅ Search translations
- ✅ Filter by status, project, file

### 📊 Activity Tracking
- ✅ Activity logging for all actions
- ✅ User activity feed
- ✅ Project activity feed
- ✅ Recent activity dashboard

### 🎨 UI/UX Features
- ✅ Responsive design
- ✅ Dark/light theme support
- ✅ Language switcher (Ukrainian, English, Russian, Polish)
- ✅ Modern, intuitive interface
- ✅ Real-time updates
- ✅ Toast notifications

## 🏗️ Architecture

### Backend
```
backend/
├── app/
│   ├── api/              # REST API endpoints
│   │   └── v1/          # API version 1
│   │       ├── auth.py      # Authentication endpoints
│   │       ├── users.py     # User management
│   │       ├── projects.py  # Project management
│   │       ├── files.py     # File management
│   │       ├── translations.py # Translation management
│   │       └── activity.py   # Activity logging
│   ├── core/             # Core configuration
│   │   ├── config.py      # Environment configuration
│   │   └── database.py    # Database connection
│   ├── models/           # SQLAlchemy models
│   │   ├── user.py        # User model
│   │   ├── project.py     # Project model
│   │   ├── file.py        # File model
│   │   ├── translation.py # Translation model
│   │   └── activity.py    # Activity model
│   ├── schemas/          # Pydantic schemas
│   ├── services/         # Business logic
│   ├── utils/            # Utility functions
│   └── main.py           # FastAPI application
├── requirements.txt      # Python dependencies
└── .env.example          # Environment template
```

### Frontend
```
frontend/
├── src/
│   ├── components/       # React components
│   │   ├── ui/           # UI components (Button, Card, etc.)
│   │   ├── Layout.tsx    # Main layout
│   │   ├── Header.tsx    # Header component
│   │   ├── Sidebar.tsx   # Sidebar navigation
│   │   └── ...
│   ├── pages/            # Page components
│   │   ├── Home.tsx      # Home page
│   │   ├── Login.tsx     # Login page
│   │   ├── Register.tsx  # Registration page
│   │   ├── Dashboard.tsx # Dashboard
│   │   ├── Projects.tsx  # Projects list
│   │   ├── ProjectDetail.tsx # Project detail
│   │   ├── Files.tsx     # Files list
│   │   ├── Translations.tsx # Translations
│   │   ├── Profile.tsx   # User profile
│   │   ├── Settings.tsx  # Settings
│   │   └── Activity.tsx  # Activity feed
│   ├── hooks/            # Custom React hooks
│   │   ├── useAuth.ts    # Authentication hook
│   │   ├── useProjects.ts # Projects hook
│   │   ├── useFiles.ts   # Files hook
│   │   └── useTranslations.ts # Translations hook
│   ├── services/         # API services
│   │   ├── api.ts        # API client
│   │   └── queryClient.ts # React Query client
│   ├── types/            # TypeScript types
│   ├── lib/              # Utility functions
│   ├── App.tsx           # Main app with routing
│   └── main.tsx          # Entry point
├── package.json
├── vite.config.ts       # Vite configuration
├── tailwind.config.js    # Tailwind CSS config
└── index.html
```

## 📦 Technologies Used

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM for database operations
- **PostgreSQL** - Relational database
- **Pydantic** - Data validation and serialization
- **Alembic** - Database migrations
- **JWT** - Authentication tokens
- **Passlib** - Password hashing
- **Python-multipart** - File upload support

### Frontend
- **React 18** - JavaScript library for UI
- **TypeScript** - Type system for JavaScript
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **React Query (TanStack)** - Data fetching and state management
- **React Router** - Client-side routing
- **React Hot Toast** - Toast notifications
- **Lucide React** - Icon library

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy (production)

## 🚀 Quick Start

### Using Docker (Recommended)

```bash
# Clone repository
git clone https://github.com/pasherlife/Vibe-Site.git
cd Vibe-Site

# Copy and configure environment
cp backend/.env.example backend/.env
# Edit backend/.env with your settings

# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost:5173
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/api/docs
```

### Manual Setup

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

## 📡 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/logout` - Logout
- `GET /api/v1/auth/me` - Get current user

### Users
- `GET /api/v1/users/me` - Get my profile
- `GET /api/v1/users/{user_id}` - Get user by ID
- `PUT /api/v1/users/me` - Update my profile
- `GET /api/v1/users/` - List all users (admin only)
- `GET /api/v1/users/search` - Search users

### Projects
- `GET /api/v1/projects/my` - Get my projects
- `GET /api/v1/projects/public` - Get public projects
- `GET /api/v1/projects/{project_id}` - Get project by ID
- `POST /api/v1/projects/` - Create new project
- `PUT /api/v1/projects/{project_id}` - Update project
- `DELETE /api/v1/projects/{project_id}` - Delete project
- `GET /api/v1/projects/{project_id}/members` - Get project members
- `POST /api/v1/projects/{project_id}/members` - Add member
- `PUT /api/v1/projects/{project_id}/members/{user_id}` - Update member role
- `DELETE /api/v1/projects/{project_id}/members/{user_id}` - Remove member
- `GET /api/v1/projects/search` - Search projects

### Files
- `POST /api/v1/files/upload` - Upload file
- `GET /api/v1/files/projects/{project_id}` - Get project files
- `GET /api/v1/files/{file_id}` - Get file by ID
- `PUT /api/v1/files/{file_id}` - Update file metadata
- `DELETE /api/v1/files/{file_id}` - Delete file
- `GET /api/v1/files/{file_id}/download` - Download file
- `GET /api/v1/files/{file_id}/versions` - Get file versions
- `GET /api/v1/files/{file_id}/stats` - Get file statistics
- `GET /api/v1/files/{file_id}/strings` - Get file strings

### Translations
- `GET /api/v1/translations/strings/{string_id}` - Get translation string
- `PUT /api/v1/translations/strings/{string_id}` - Update translation string
- `GET /api/v1/translations/files/{file_id}/strings` - Get strings by file
- `POST /api/v1/translations/suggestions` - Create suggestion
- `GET /api/v1/translations/strings/{string_id}/suggestions` - Get suggestions
- `PUT /api/v1/translations/suggestions/{suggestion_id}/status` - Update suggestion status
- `DELETE /api/v1/translations/suggestions/{suggestion_id}` - Delete suggestion
- `POST /api/v1/translations/comments` - Create comment
- `GET /api/v1/translations/strings/{string_id}/comments` - Get comments
- `PUT /api/v1/translations/comments/{comment_id}` - Update comment
- `DELETE /api/v1/translations/comments/{comment_id}` - Delete comment
- `POST /api/v1/translations/strings/{string_id}/lock` - Lock string
- `POST /api/v1/translations/strings/{string_id}/unlock` - Unlock string
- `GET /api/v1/translations/search` - Search translations

### Activity
- `GET /api/v1/activity/recent` - Get recent activity
- `GET /api/v1/activity/user` - Get my activity
- `GET /api/v1/activity/projects/{project_id}` - Get project activity
- `GET /api/v1/activity/{log_id}` - Get specific activity log

## 📊 Database Schema

### Main Tables

1. **users** - User accounts
2. **projects** - Projects for organizing work
3. **project_members** - Project member associations
4. **translation_files** - Uploaded translation files
5. **file_versions** - File version history
6. **translation_strings** - Individual translation strings
7. **translation_suggestions** - User-submitted translation suggestions
8. **translation_comments** - Comments on translation strings
9. **activity_logs** - Activity tracking

## 🎨 UI Components

### Layout
- **Header** - Top navigation bar with logo, search, user menu
- **Sidebar** - Left navigation with project links
- **Layout** - Main application layout

### UI Components
- **Button** - Customizable buttons
- **Card** - Content cards
- **Input** - Form inputs
- **Label** - Form labels
- **Badge** - Status badges
- **Table** - Data tables
- **Tabs** - Tab navigation
- **Avatar** - User avatars
- **Select** - Dropdown selects

### Custom Components
- **UserAvatar** - User avatar with dropdown
- **LanguageSwitcher** - Language selection
- **ThemeToggle** - Dark/light theme toggle
- **SearchBar** - Search input with icon
- **ProjectFilesTab** - Files tab for projects
- **ProjectMembersTab** - Members tab for projects
- **ProjectActivityTab** - Activity tab for projects

## 🌐 Pages

1. **Home** - Landing page with features overview
2. **Login** - User login page
3. **Register** - User registration page
4. **Dashboard** - Main dashboard with statistics
5. **Projects** - List of user projects
6. **Project Detail** - Detailed project view with tabs
7. **Files** - List of all user files
8. **Translations** - Translation management interface
9. **Profile** - User profile management
10. **Settings** - Application settings
11. **Activity** - Activity feed
12. **NotFound** - 404 error page

## 🔧 Configuration

### Environment Variables

#### Backend
```env
# Database
DATABASE_URL=postgresql+psycopg2://user:password@host:port/database

# JWT Authentication
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Application
DEBUG=True
APP_NAME="Game Localization Portal"

# CORS
FRONTEND_URL=http://localhost:5173

# File upload
MAX_FILE_SIZE_MB=50
ALLOWED_EXTENSIONS=".locres,.csv,.json,.txt"
UPLOAD_DIR=uploads
```

#### Frontend
```env
VITE_API_URL=http://localhost:8000/api/v1
```

## 📁 File Structure Summary

```
Vibe-Site/
├── backend/                  # Backend application
│   └── app/                  # FastAPI application
│       ├── api/              # API endpoints
│       ├── core/             # Core configuration
│       ├── models/           # Database models
│       ├── schemas/          # Pydantic schemas
│       ├── services/         # Business logic
│       └── utils/            # Utility functions
│
├── frontend/                 # Frontend application
│   └── src/                  # React source
│       ├── components/       # React components
│       ├── pages/            # Page components
│       ├── hooks/            # Custom hooks
│       ├── services/         # API services
│       └── types/            # TypeScript types
│
├── docker-compose.yml        # Docker Compose configuration
├── Dockerfile                # Backend Dockerfile
├── Dockerfile.frontend       # Frontend Dockerfile
├── nginx.conf                # Nginx configuration
├── README.md                 # Project documentation
├── DEPLOYMENT.md             # Deployment guide
└── SUMMARY.md                # This file
```

## 🎯 Use Cases

### For Game Developers
1. Create a project for your game
2. Upload localization files (locres, CSV, JSON, TXT)
3. Invite translators to your project
4. Track translation progress
5. Review and approve translations

### For Translators
1. Join projects or create your own
2. View and translate text strings
3. Submit translation suggestions
4. Comment on translations
5. Track your contributions

### For Project Managers
1. Create and manage projects
2. Add and manage team members
3. Set permissions and roles
4. Monitor project progress
5. Review activity logs

## 🚀 Performance Considerations

- **Database Indexing**: All frequently queried fields are indexed
- **Caching**: React Query provides client-side caching
- **Pagination**: All list endpoints support pagination
- **File Processing**: File parsing happens in background
- **Optimized Queries**: SQLAlchemy queries are optimized

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt for secure password storage
- **Role-Based Access Control**: Fine-grained permissions
- **Input Validation**: Pydantic validation for all inputs
- **CORS**: Configurable CORS settings
- **Rate Limiting**: Can be configured in Nginx

## 📈 Scalability

- **Horizontal Scaling**: Can run multiple API instances
- **Database Connection Pooling**: Supports connection pooling
- **Async Operations**: Background file processing
- **Containerized**: Easy to scale with Docker/Kubernetes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests
5. Submit a pull request

## 📄 License

MIT License - Feel free to use, modify, and distribute.

---

**Created with ❤️ for game developers and translators**

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md)

For API documentation, visit `/api/docs` when the backend is running.
