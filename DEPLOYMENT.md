# 🚀 Deployment Guide

## Quick Start with Docker (Recommended)

The easiest way to deploy the Game Localization Portal is using Docker Compose.

### Prerequisites
- Docker installed on your system
- Docker Compose (included with Docker Desktop)
- At least 4GB of RAM available

### Steps

1. **Clone the repository:**
```bash
git clone https://github.com/pasherlife/Vibe-Site.git
cd Vibe-Site
```

2. **Configure environment:**
```bash
# Copy example environment file
cp backend/.env.example backend/.env

# Edit backend/.env with your settings:
# - DATABASE_URL: PostgreSQL connection URL
# - SECRET_KEY: Your JWT secret key (change in production!)
# - FRONTEND_URL: Your frontend URL
```

3. **Start all services:**
```bash
docker-compose up -d
```

4. **Wait for services to initialize:**
```bash
# Check logs
docker-compose logs -f
```

5. **Access the application:**
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/api/docs

6. **Stop services:**
```bash
docker-compose down
```

## Manual Deployment

### Backend Setup

1. **Install Python 3.11+:**
```bash
# On Ubuntu/Debian
sudo apt update
sudo apt install python3.11 python3.11-venv python3.11-dev

# On macOS
brew install python@3.11
```

2. **Create virtual environment:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# OR
venv\Scripts\activate  # Windows
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

4. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your settings
```

5. **Setup PostgreSQL:**
```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib  # Ubuntu/Debian

# Create database and user
sudo -u postgres psql
CREATE DATABASE game_localization;
CREATE USER game_localization_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE game_localization TO game_localization_user;
\q
```

6. **Update DATABASE_URL in .env:**
```
DATABASE_URL=postgresql+psycopg2://game_localization_user:your_password@localhost:5432/game_localization
```

7. **Run migrations:**
```bash
alembic upgrade head
```

8. **Start the server:**
```bash
uvicorn app.main:app --reload
```

### Frontend Setup

1. **Install Node.js 18+:**
```bash
# On Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# On macOS
brew install node@18
```

2. **Install dependencies:**
```bash
cd frontend
npm install
```

3. **Configure API URL:**
```bash
# Edit vite.config.ts or create .env file
VITE_API_URL=http://localhost:8000/api/v1
```

4. **Start development server:**
```bash
npm run dev
```

5. **Build for production:**
```bash
npm run build
npm run preview
```

## Production Deployment

### Using Docker with Nginx

1. **Update docker-compose.yml:**
```yaml
# Remove the frontend service and add nginx
services:
  api:
    # ... existing config
    environment:
      - DEBUG=False
      - SECRET_KEY=your-strong-secret-key
      - DATABASE_URL=your-production-db-url
      - FRONTEND_URL=https://your-domain.com
    
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./frontend/dist:/usr/share/nginx/html
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - api
    profiles:
      - production
```

2. **Build frontend for production:**
```bash
cd frontend
npm run build
```

3. **Setup SSL certificates (optional):**
```bash
# Using Let's Encrypt with Certbot
sudo certbot certonly --standalone -d your-domain.com
# Copy certificates to ssl directory
cp /etc/letsencrypt/live/your-domain.com/* ./ssl/
```

4. **Start production services:**
```bash
docker-compose --profile production up -d --build
```

### Using Nginx without Docker

1. **Install Nginx:**
```bash
sudo apt install nginx
```

2. **Configure Nginx:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        root /var/www/game-localization/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
    }
}
```

3. **Start services:**
```bash
# Start backend
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000

# Start Nginx
sudo systemctl restart nginx
```

## Configuration

### Environment Variables

#### Backend (.env)
```
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

#### Frontend (vite.config.ts or .env)
```
VITE_API_URL=http://localhost:8000/api/v1
```

## Database Management

### Create migrations
```bash
cd backend
alembic revision --autogenerate -m "your_message"
```

### Apply migrations
```bash
alembic upgrade head
```

### Rollback migrations
```bash
alembic downgrade -1
```

## Monitoring

### Check service status
```bash
docker-compose ps
```

### View logs
```bash
docker-compose logs -f api
docker-compose logs -f frontend
```

### Database connection
```bash
# Using psql
docker exec -it game_localization_db psql -U postgres -d game_localization
```

## Troubleshooting

### Common Issues

1. **Database connection failed:**
   - Check DATABASE_URL in .env
   - Verify PostgreSQL is running
   - Check credentials

2. **Port already in use:**
   - Change ports in docker-compose.yml
   - Stop existing services: `docker-compose down`

3. **Frontend can't connect to API:**
   - Check CORS settings in backend
   - Verify FRONTEND_URL in .env
   - Check API URL in frontend configuration

4. **File upload not working:**
   - Check UPLOAD_DIR exists and has write permissions
   - Verify MAX_FILE_SIZE_MB is large enough
   - Check ALLOWED_EXTENSIONS includes your file type

### Debug Mode

Enable debug mode for detailed error messages:
```bash
# In backend/.env
DEBUG=True

# Restart services
docker-compose down && docker-compose up -d
```

## Scaling

### For Production

1. **Use a production WSGI server:**
```bash
# Install gunicorn
pip install gunicorn

# Start with gunicorn
gunicorn -k uvicorn.workers.UvicornWorker -w 4 -b 0.0.0.0:8000 app.main:app
```

2. **Use a reverse proxy (Nginx):**
```nginx
upstream api {
    server localhost:8000;
    server localhost:8001;
    server localhost:8002;
    server localhost:8003;
}

server {
    listen 80;
    
    location /api/ {
        proxy_pass http://api;
        # ... other proxy settings
    }
}
```

3. **Database connection pooling:**
```bash
# Install asyncpg for better performance
pip install asyncpg

# Update DATABASE_URL
DATABASE_URL=postgresql+asyncpg://user:password@host:port/database
```

## Updates

### Pull latest changes
```bash
git pull origin main
```

### Update dependencies
```bash
# Backend
cd backend
pip install -r requirements.txt --upgrade

# Frontend
cd frontend
npm update
```

### Rebuild and restart
```bash
docker-compose down
docker-compose up -d --build
```

## Security Best Practices

1. **Use strong secret key:**
   ```python
   # Generate a strong secret key
   import secrets
   print(secrets.token_urlsafe(32))
   ```

2. **Use HTTPS:**
   - Configure SSL certificates
   - Use HTTPS in production

3. **Database security:**
   - Use strong passwords
   - Limit database permissions
   - Regular backups

4. **Rate limiting:**
   - Configure rate limiting in Nginx
   - Use API rate limiting

5. **Regular updates:**
   - Keep dependencies updated
   - Apply security patches

## Backup

### Database backup
```bash
# Using pg_dump
docker exec game_localization_db pg_dump -U postgres game_localization > backup.sql

# Restore
cat backup.sql | docker exec -i game_localization_db psql -U postgres game_localization
```

### Full backup
```bash
# Create backup directory
mkdir -p backups

# Backup database
cp backup.sql backups/

# Backup uploads
tar -czvf backups/uploads.tar.gz uploads/

# Backup configuration
cp .env backups/
cp docker-compose.yml backups/
```

---

For more information, check the [README.md](README.md) file.
