# Distribution System

Multi-tier Stock Inventory & Warehousing System for a Distributor.

## Tech Stack

- **Backend**: Python, Django, Django REST Framework, SimpleJWT
- **Frontend**: Next.js, TypeScript, Tailwind CSS
- **Database**: PostgreSQL
- **Cache / Background Jobs**: Redis + Celery
- **File Storage**: Cloudflare R2
- **PDF Generation**: WeasyPrint
- **Hosting**: Railway (starting), DigitalOcean (future)

## Project Structure

```bash
distribution-system/
├── backend/          # Django project
├── frontend/         # Next.js project
└── README.md

Setup on a New Device (Laptop or Desktop)
1. Clone the repository
git clone https://github.com/jxn-24/distribution-system.git
cd distribution-system

2. Backend Setup
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

Create the .env file:
nano .env
Paste this (update the password):

envDEBUG=True
SECRET_KEY=your-secret-key-here
DATABASE_URL=postgres://distribution_user:flow2026@localhost:5432/distribution_db
REDIS_URL=redis://localhost:6379/0
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000

3. PostgreSQL Database
Make sure PostgreSQL is installed and running, then create the database and user (only needed once per machine):
SQLCREATE DATABASE distribution_db;
CREATE USER distribution_user WITH PASSWORD 'YourStrongPasswordHere';
GRANT ALL PRIVILEGES ON DATABASE distribution_db TO distribution_user;


4. Frontend Setup
cd ../frontend
npm install

Create the environment file:
nano .env.local
envNEXT_PUBLIC_API_URL=http://localhost:8000/api

5. Run the Project

Terminal 1 – Backend:
Bashcd backend
source venv/bin/activate
python manage.py migrate
python manage.py runserver

Terminal 2 – Frontend:
Bashcd frontend
npm run dev

Backend: http://localhost:8000
Frontend: http://localhost:3000

Important Notes

Always activate the virtual environment (source venv/bin/activate) before working on the backend.
Never commit the .env or .env.local files.
Keep both laptop and desktop updated using:Bashgit pull

Current Status

Phase 0: Foundation (In Progress)

text---

After pasting the content, save the file and run these commands:

```bash
git add README.md
git commit -m "Add project README with setup instructions"
git push