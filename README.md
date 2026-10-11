# InterviewIQ - AI Mock Interview Platform

InterviewIQ is a full-stack, production-minded AI mock interview platform engineered for college students preparing for campus placements, software engineering internships, and entry-level developer jobs.

---

## Key Features

1. **User Auth & Profiles**: User registration, login, and profile management with college & graduation year tracking.
2. **Resume Parser**: PDF (PyMuPDF) and DOCX (python-docx) extraction of candidate skills, education, projects, and work experience.
3. **Targeted Interview Configuration**: Configure target company (e.g. Google, Amazon, Microsoft), job role, interview type (HR, Technical, Behavioral, Mixed), difficulty, and target duration.
4. **Interactive AI Interviewer**: Bounded single-question generation, follow-ups, and browser refresh session state recovery.
5. **Deterministic Evaluation**: Weighted scoring (Technical Correctness 35%, Relevance 20%, Reasoning 20%, Clarity 15%, Structure 10%).
6. **Performance Report Card**: Comprehensive report card with dimension visualizer, question-by-question reviews with stronger answer examples, and an actionable 7-day practice plan.

---

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS v4, React Router, TanStack Query, Lucide React, Recharts.
- **Backend**: Python 3.13, FastAPI, Uvicorn, Pydantic v2, pydantic-settings, SQLAlchemy 2, PyMuPDF, python-docx, PyJWT.
- **Database & Auth**: Supabase / PostgreSQL (with SQLite out-of-the-box local development fallback).
- **AI Engine**: Configurable provider (OpenAI, Gemini, Anthropic) + Deterministic Mock AI Provider for offline execution.

---

## Quick Start Guide

### Prerequisites
- Node.js (v20+)
- Python (v3.11+)

### 1. Backend Setup & Startup

```powershell
cd backend
python -m venv venv
.\venv\Scripts\pip install -e .
.\venv\Scripts\uvicorn app.main:app --reload --port 8000
```
Backend API will be running at `http://localhost:8000`  
Swagger API Docs available at `http://localhost:8000/api/v1/docs`

### 2. Frontend Setup & Startup

```powershell
cd frontend
npm install
npm run dev
```
Frontend Web App will be running at `http://localhost:3000`

---

## Running Automated Tests

```powershell
# Run backend pytest suite
cd backend
.\venv\Scripts\pytest

# Run frontend build check
cd frontend
npm run build
```

---

## Project Structure

```
interviewiq/
  frontend/          # Vite React TS + Tailwind CSS v4 Web App
  backend/           # FastAPI Python Backend + SQLAlchemy 2
  docs/              # Architecture, API, Database & Testing docs
  README.md          # Setup & Usage Documentation
```
