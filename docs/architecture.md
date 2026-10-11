# InterviewIQ System Architecture

## Overview

InterviewIQ is a full-stack AI mock interview platform built for college students preparing for campus placements, software engineering internships, and entry-level developer roles.

```
+-------------------------------------------------------------+
|                     React + TypeScript Frontend             |
|  Vite | Tailwind CSS v4 | TanStack Query | React Router    |
+------------------------------+------------------------------+
                               | REST API (JSON / Multipart)
                               v
+-------------------------------------------------------------+
|                     FastAPI Python Backend                  |
|  Routers -> Repositories -> Services -> AI Engine Provider  |
+------------------------------+------------------------------+
                               |
            +------------------+------------------+
            |                                     |
            v                                     v
+-----------------------+             +-----------------------+
|  SQLAlchemy 2 DB      |             |  PyMuPDF & docx       |
|  (SQLite / PostgreSQL)|             |  Resume Parsers       |
+-----------------------+             +-----------------------+
```

## Core Components

1. **Frontend Application**: Vite React TypeScript SPA with Tailwind CSS v4, providing responsive Dashboard, Drag-and-Drop Resume Parser, AI Interview Room with live session recovery, and Report Card visualizer.
2. **FastAPI Backend**: Layered architecture separating routes (`/api/v1`), Pydantic schemas, repositories, and AI services.
3. **Resume Parsing Service**: Native text extraction using PyMuPDF (PDF) and python-docx (DOCX) with automatic skills and project structuring.
4. **AI Engine Provider**: Abstraction supporting OpenAI, Gemini, Anthropic, or a deterministic Mock AI Provider for offline testing.
5. **Interview Engine**: Bounded state machine handling interview progression, single question prompts, answer evaluations, and 7-day personalized practice roadmaps.
