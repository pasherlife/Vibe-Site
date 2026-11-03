# Game Localization Portal

Портал для локалізації (перекладу) ігор. Дозволяє завантажувати файли locres, CSV, JSON, TXT для перекладу та організовувати командної роботи над спільними файлами.

## 🚀 Огляд

Game Localization Portal - це повнофункціональний веб-застосунок для управління локалізацією ігор. Він надає:

- **Аутентифікація користувачів** - Реєстрація, вхід, вихід
- **Профілі користувачів** - Особисті дані, налаштування
- **Командна робота** - Створення проєктів, запрошення учасників
- **Завантаження файлів** - Підтримка locres, CSV, JSON, TXT
- **Система перекладу** - Зручний інтерфейс для перекладу текстових рядків
- **Відстеження активності** - Журнал дій користувачів

## 📦 Технології

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM для роботи з базою даних
- **PostgreSQL** - Реляційна база даних
- **JWT Authentication** - Аутентифікація через JWT токени
- **Pydantic** - Валідація даних
- **Alembic** - Міграції бази даних

### Frontend
- **React 18** - JavaScript бібліотека для побудови UI
- **TypeScript** - Типізація для React
- **Vite** - Швидкий збірник проєктів
- **Tailwind CSS** - Utility-first CSS framework
- **React Query** - Управління станом та запитами
- **React Router** - Маршрутизація
- **Lucide React** - Іконки

## 🛠️ Встановлення

### Локальне встановлення (без Docker)

#### Backend

1. Клонуйте репозиторій:
```bash
cd backend
```

2. Створіть віртуальне оточення:
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# або
venv\Scripts\activate  # Windows
```

3. Встановіть залежності:
```bash
pip install -r requirements.txt
```

4. Створіть файл `.env` на основі `.env.example`:
```bash
cp .env.example .env
```

5. Налаштуйте базу даних PostgreSQL та оновіть `DATABASE_URL` у `.env`

6. Запустіть міграції:
```bash
alembic upgrade head
```

7. Запустіть сервер:
```bash
uvicorn app.main:app --reload
```

Сервер буде доступний на `http://localhost:8000`

#### Frontend

1. Перейдіть до папки frontend:
```bash
cd frontend
```

2. Встановіть залежності:
```bash
npm install
```

3. Запустіть розробницький сервер:
```bash
npm run dev
```

Frontend буде доступний на `http://localhost:5173`

### Встановлення через Docker (рекомендовано)

1. Клонуйте репозиторій

2. Створіть файл `.env` у папці backend:
```bash
cd backend
cp .env.example .env
```

3. Запустіть всі сервіси через Docker Compose:
```bash
docker-compose up -d
```

4. Дочекайтеся, поки всі контейнери запустяться:
- Backend API: `http://localhost:8000`
- Frontend: `http://localhost:5173`
- Database: `http://localhost:5432`

5. Для зупинки:
```bash
docker-compose down
```

## 🌐 API Документація

API документація доступна за адресою:
- Swagger UI: `http://localhost:8000/api/docs`
- ReDoc: `http://localhost:8000/api/redoc`

## 📁 Структура проєкту

```
game-localization-portal/
├── backend/                  # Backend (FastAPI)
│   ├── app/
│   │   ├── api/              # API endpoints
│   │   ├── core/             # Core configuration
│   │   ├── models/           # Database models
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── services/         # Business logic
│   │   └── utils/            # Utility functions
│   ├── requirements.txt
│   └── main.py
│
├── frontend/                 # Frontend (React)
│   ├── public/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/            # Page components
│   │   ├── hooks/            # Custom hooks
│   │   ├── services/         # API services
│   │   ├── types/            # TypeScript types
│   │   └── lib/              # Utility functions
│   ├── package.json
│   └── vite.config.ts
│
├── docker-compose.yml
├── Dockerfile
└── README.md
```

## 🎯 Основні можливості

### Користувачі
- Реєстрація та аутентифікація
- Управління профілем
- Пошук інших користувачів

### Проєкти
- Створення проєктів
- Управління учасниками
- Налаштування прав доступу
- Публічні та приватні проєкти

### Файли
- Завантаження файлів (locres, CSV, JSON, TXT)
- Автоматичний парсинг файлів
- Версіонування файлів
- Завантаження файлів

### Переклади
- Переклад текстових рядків
- Пропозиції перекладів
- Коментарі до перекладів
- Status management (untranslated, translated, reviewed, approved)
- Пошук перекладів
- Блокування рядків

### Активність
- Журнал дій користувачів
- Відстеження змін
- Фільтрація за проєктами

## 📊 Моделі даних

### User
- `id` - Унікальний ідентифікатор
- `username` - Логін користувача
- `email` - Email адреса
- `hashed_password` - Гешований пароль
- `full_name` - Повне ім'я
- `avatar_url` - URL аватара
- `role` - Роль (admin, translator, reviewer, user)
- `is_active` - Чи активний користувач
- `is_verified` - Чи підтверджений email

### Project
- `id` - Унікальний ідентифікатор
- `name` - Назва проєкту
- `description` - Опис проєкту
- `owner_id` - ID власника
- `is_public` - Чи публічний проєкт
- `allow_join_requests` - Чи дозволено запроси на вступ

### TranslationFile
- `id` - Унікальний ідентифікатор
- `project_id` - ID проєкту
- `filename` - Назва файлу
- `file_type` - Тип файлу (locres, csv, json, txt)
- `file_path` - Шлях до файлу
- `status` - Стан (pending, processing, ready, error)
- `source_language` - Мова джерела
- `target_language` - Цільова мова

### TranslationString
- `id` - Унікальний ідентифікатор
- `file_id` - ID файлу
- `key` - Ключ рядка
- `source_text` - Оригінальний текст
- `target_text` - Перекладений текст
- `status` - Стан (untranslated, translated, reviewed, approved, rejected)
- `is_locked` - Чи заблокований рядок

## 🔐 Аутентифікація

Аутентифікація здійснюється через JWT токени. Після успішного входу, токен зберігається у localStorage та відправляється у заголовку `Authorization: Bearer <token>` при кожному запиті.

## 🎨 UI/UX

- **Адаптивний дизайн** - Працює на всіх пристроях
- **Темна тема** - Підтримка світлої та темної теми
- **Мовна підтримка** - Локалізація інтерфейсу
- **Зручний інтерфейс** - Інтуїтивний та сучасний дизайн

## 🚀 Deployment

### Для розробки
```bash
docker-compose up -d
```

### Для production

1. Оновіть настройки у `.env`:
```
DEBUG=False
SECRET_KEY=your-production-secret-key
DATABASE_URL=your-production-database-url
```

2. Запустіть через Docker Compose з production профілем:
```bash
docker-compose --profile production up -d
```

## 🤝 Внесок

Внески вітаються! Будь ласка, створюйте Pull Request для виправлення помилок або додавання нових функцій.

## 📄 Ліцензія

Цей проєкт поширюється під ліцензією MIT.

---

Створено з ❤️ для розробників ігор
