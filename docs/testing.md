# Testing Guide

InterviewIQ includes automated backend pytest suites (unit and integration tests) and frontend build verification.

## Running Backend Tests

Navigate to `backend/`:
```powershell
cd backend
.\venv\Scripts\pytest
```

Output verifies:
- `test_resume_parser_structuring`: Validates skills and project extraction.
- `test_answer_evaluator_score_calculation`: Verifies rubric weight calculations.
- `test_interview_planner`: Ensures correct question counts.
- `test_health_check`: Verifies API health endpoint.
- `test_get_current_user_profile`: Verifies authentication token decoding.
- `test_update_profile`: Verifies profile update persistence.

## Running Frontend Verification

Navigate to `frontend/`:
```powershell
cd frontend
npm run build
```
Runs TypeScript strict check and Vite production bundle build.
