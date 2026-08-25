# Three-Level Distribution System

Multi-tier Stock Inventory & Warehousing System for a Distributor.

## Tech Stack

- **Backend**: Python, Django, Django REST Framework, SimpleJWT
- **Frontend**: Next.js, TypeScript, Tailwind CSS
- **Database**: PostgreSQL
- **Cache / Background Jobs**: Redis + Celery
- **File Storage**: Cloudflare R2
- **PDF Generation**: WeasyPrint
- **Hosting**: Railway (starting), DigitalOcean (future)



## Setup on a New Device (Laptop or Desktop)
1. ## Clone the repository
git clone https://github.com/jxn-24/distribution-system.git
cd distribution-system

2. ## Backend Setup
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

## Create the .env file:
nano .env
Paste this (update the password):

DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=postgres://distribution_user:YourPassword@localhost:5432/distribution_db
REDIS_URL=redis://localhost:6379/0

#Cloudflare R2
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_STORAGE_BUCKET_NAME=threelevel-distribution
AWS_S3_ENDPOINT_URL=https://your-account-id.r2.cloudflarestorage.com
AWS_S3_REGION_NAME=auto

ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000

3. ## PostgreSQL Database
Make sure PostgreSQL is installed and running, then create the database and user (only needed once per machine):
SQLCREATE DATABASE distribution_db;
CREATE USER distribution_user WITH PASSWORD 'YourStrongPasswordHere';
GRANT ALL PRIVILEGES ON DATABASE distribution_db TO distribution_user;


4. ## Frontend Setup
cd ../frontend
npm install

## Create the environment file:
nano .env.local
envNEXT_PUBLIC_API_URL=http://localhost:8000/api

5. ## Run the Project

Terminal 1 – Backend:
cd backend
source venv/bin/activate
python manage.py migrate
python manage.py runserver

Terminal 2 – Celery Worker:
cd backend
source venv/bin/activate
celery -A config worker -l info

Terminal 3 – Frontend:
cd frontend
npm run dev

Backend: http://localhost:8000
Frontend: http://localhost:3000

## Important Notes

Always activate the virtual environment (source venv/bin/activate) before working on the backend.
Never commit the .env or .env.local files.
Keep both laptop and desktop updated using:Bashgit pull
Public Sign Up is for Customers only
Internal staff accounts are created by Super Admin / Admin
Never commit the .env file

Current Status

Phase 0: Foundation (Complete)(25.08.2026)

