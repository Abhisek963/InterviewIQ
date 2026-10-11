# Database Schema & Models

InterviewIQ uses SQLAlchemy 2 with UUID primary keys and JSON fields.

## Entity Schema

### `profiles`
- `id`: String(36), Primary Key
- `full_name`: String(255), Not Null
- `college_name`: String(255), Nullable
- `graduation_year`: Integer, Nullable
- `created_at`, `updated_at`: DateTime

### `resumes`
- `id`: String(36), Primary Key
- `user_id`: Foreign Key to `profiles.id`
- `file_path`: String(512)
- `original_filename`: String(255)
- `extracted_text`: Text
- `parsed_profile`: JSON (skills, education, projects, summary)
- `status`: String(32) ('uploaded', 'processing', 'ready', 'failed')
- `created_at`, `updated_at`: DateTime

### `interview_sessions`
- `id`: String(36), Primary Key
- `user_id`: Foreign Key to `profiles.id`
- `resume_id`: Foreign Key to `resumes.id`
- `company_name`: String(255)
- `job_title`: String(255)
- `interview_type`: String(64) ('HR', 'technical', 'behavioral', 'mixed')
- `difficulty`: String(32) ('beginner', 'intermediate', 'advanced')
- `duration_minutes`: Integer (10, 20, 30)
- `question_plan`: JSON
- `status`: String(32) ('created', 'in_progress', 'completed', 'abandoned')
- `current_question_index`: Integer
- `started_at`, `completed_at`: DateTime

### `interview_questions`
- `id`: String(36), Primary Key
- `session_id`: Foreign Key to `interview_sessions.id`
- `sequence_number`: Integer
- `question_text`: Text
- `category`, `topic`, `difficulty`: String
- `evaluation_rubric`: JSON
- `UniqueConstraint('session_id', 'sequence_number')`

### `answers`
- `id`: String(36), Primary Key
- `question_id`: Foreign Key to `interview_questions.id`
- `user_id`: Foreign Key to `profiles.id`
- `answer_text`: Text
- `score`: Float (0.0 to 100.0)
- `dimension_scores`: JSON
- `feedback`: JSON
- `response_time_seconds`: Integer

### `interview_reports`
- `id`: String(36), Primary Key
- `session_id`: Foreign Key to `interview_sessions.id`, Unique
- `user_id`: Foreign Key to `profiles.id`
- `overall_score`: Float
- `dimension_scores`: JSON
- `strengths`, `improvements`, `answer_reviews`, `practice_plan`: JSON
- `summary`: Text
- `status`: String(32) ('pending', 'generating', 'ready', 'failed')
