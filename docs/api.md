# InterviewIQ API Reference

Base Endpoint: `/api/v1`

## Endpoints

### Health
- `GET /api/v1/health` - Returns service status and mock AI mode status.

### Users
- `GET /api/v1/users/me` - Retrieve current user profile.
- `PATCH /api/v1/users/me` - Update profile details (full_name, college_name, graduation_year).

### Resumes
- `POST /api/v1/resumes` - Upload PDF or DOCX file (max 10MB). Automatically parses text and extracts skills/projects.
- `GET /api/v1/resumes` - List user's uploaded resumes.
- `GET /api/v1/resumes/{resume_id}` - Get resume details and parsed profile JSON.
- `DELETE /api/v1/resumes/{resume_id}` - Delete resume record and file from disk.

### Interviews
- `POST /api/v1/interviews` - Create new interview session for target company, role, difficulty, and duration.
- `GET /api/v1/interviews` - List user's interview sessions.
- `GET /api/v1/interviews/{session_id}` - Get session state.
- `POST /api/v1/interviews/{session_id}/start` - Start session and retrieve initial question.
- `GET /api/v1/interviews/{session_id}/questions/current` - Retrieve active question.
- `POST /api/v1/interviews/{session_id}/answers` - Submit answer for current question, evaluate, and advance.
- `POST /api/v1/interviews/{session_id}/finish` - Finish interview session and trigger report generation.

### Reports
- `GET /api/v1/interviews/{session_id}/report` - Get final evaluation report and 7-day practice plan for session.
- `GET /api/v1/reports` - List all reports for current user.
- `GET /api/v1/reports/{report_id}` - Get specific report by ID.
