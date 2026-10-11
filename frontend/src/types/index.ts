export interface UserProfile {
  id: string;
  full_name: string;
  college_name?: string;
  graduation_year?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ProjectItem {
  title: string;
  description: string;
  technologies: string[];
}

export interface EducationItem {
  degree: string;
  institution: string;
  year?: string;
  gpa?: string;
}

export interface ExperienceItem {
  role: string;
  company: string;
  duration?: string;
  description?: string;
}

export interface ParsedProfile {
  skills: string[];
  education: EducationItem[];
  projects: ProjectItem[];
  internships: ExperienceItem[];
  certifications: string[];
  summary: string;
}

export interface Resume {
  id: string;
  user_id: string;
  original_filename: string;
  status: 'uploaded' | 'processing' | 'ready' | 'failed';
  parsed_profile?: ParsedProfile;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface InterviewSession {
  id: string;
  user_id: string;
  resume_id: string;
  company_name: string;
  job_title: string;
  interview_type: 'HR' | 'technical' | 'behavioral' | 'mixed';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration_minutes: number;
  question_plan?: any[];
  status: 'created' | 'in_progress' | 'completed' | 'abandoned';
  current_question_index: number;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  total_planned_questions?: number;
}

export interface InterviewQuestion {
  id: string;
  session_id: string;
  sequence_number: number;
  question_text: string;
  category: string;
  topic: string;
  difficulty: string;
  parent_question_id?: string;
  created_at: string;
}

export interface DimensionScores {
  technical_correctness: number;
  relevance: number;
  reasoning_and_depth: number;
  communication_clarity: number;
  answer_structure: number;
}

export interface AnswerFeedback {
  score: number;
  dimension_scores: DimensionScores;
  correct_concepts: string[];
  missing_concepts: string[];
  factual_errors: string[];
  strengths: string[];
  improvements: string[];
  example_stronger_answer?: string;
  confidence_level: number;
  evaluation_notes?: string;
}

export interface QuestionAnswerReview {
  sequence_number: number;
  question_text: string;
  user_answer: string;
  score: number;
  dimension_scores: DimensionScores;
  feedback_summary: string;
  example_stronger_answer?: string;
}

export interface PracticeDayPlan {
  day: number;
  focus_area: string;
  tasks: string[];
  resource_recommendations: string[];
}

export interface InterviewReport {
  id: string;
  session_id: string;
  user_id: string;
  overall_score?: number;
  dimension_scores?: DimensionScores;
  strengths: string[];
  improvements: string[];
  answer_reviews: QuestionAnswerReview[];
  practice_plan: PracticeDayPlan[];
  summary?: string;
  status: 'pending' | 'generating' | 'ready' | 'failed';
  created_at: string;
}
