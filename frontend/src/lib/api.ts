import { UserProfile, Resume, InterviewSession, InterviewQuestion, InterviewReport } from '../types';

const API_BASE = '/api/v1';

function getAuthHeader(): Record<string, string> {
  const devToken = localStorage.getItem('interviewiq_dev_token') || 'dev-token-student-001';
  return {
    Authorization: `Bearer ${devToken}`
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorDetail = 'An error occurred';
    try {
      const data = await res.json();
      errorDetail = data.detail || errorDetail;
    } catch (e) {
      errorDetail = res.statusText;
    }
    throw new Error(errorDetail);
  }
  if (res.status === 204) {
    return {} as T;
  }
  return res.json();
}

export const api = {
  // Users
  getUserProfile: async (): Promise<UserProfile> => {
    const res = await fetch(`${API_BASE}/users/me`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse<UserProfile>(res);
  },

  updateUserProfile: async (data: Partial<UserProfile>): Promise<UserProfile> => {
    const res = await fetch(`${API_BASE}/users/me`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(data)
    });
    return handleResponse<UserProfile>(res);
  },

  // Resumes
  uploadResume: async (file: File): Promise<Resume> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/resumes`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
      body: formData
    });
    return handleResponse<Resume>(res);
  },

  listResumes: async (): Promise<Resume[]> => {
    const res = await fetch(`${API_BASE}/resumes`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse<Resume[]>(res);
  },

  getResume: async (resumeId: string): Promise<Resume> => {
    const res = await fetch(`${API_BASE}/resumes/${resumeId}`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse<Resume>(res);
  },

  deleteResume: async (resumeId: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/resumes/${resumeId}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() }
    });
    return handleResponse<void>(res);
  },

  // Interviews
  createInterview: async (data: {
    resume_id: string;
    company_name: string;
    job_title: string;
    interview_type: string;
    difficulty: string;
    duration_minutes: number;
  }): Promise<InterviewSession> => {
    const res = await fetch(`${API_BASE}/interviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(data)
    });
    return handleResponse<InterviewSession>(res);
  },

  listInterviews: async (): Promise<InterviewSession[]> => {
    const res = await fetch(`${API_BASE}/interviews`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse<InterviewSession[]>(res);
  },

  getInterviewSession: async (sessionId: string): Promise<InterviewSession> => {
    const res = await fetch(`${API_BASE}/interviews/${sessionId}`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse<InterviewSession>(res);
  },

  startInterview: async (sessionId: string): Promise<InterviewQuestion> => {
    const res = await fetch(`${API_BASE}/interviews/${sessionId}/start`, {
      method: 'POST',
      headers: { ...getAuthHeader() }
    });
    return handleResponse<InterviewQuestion>(res);
  },

  getCurrentQuestion: async (sessionId: string): Promise<InterviewQuestion> => {
    const res = await fetch(`${API_BASE}/interviews/${sessionId}/questions/current`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse<InterviewQuestion>(res);
  },

  submitAnswer: async (
    sessionId: string,
    answerText: string,
    responseTimeSeconds?: number
  ) => {
    const res = await fetch(`${API_BASE}/interviews/${sessionId}/answers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({
        answer_text: answerText,
        response_time_seconds: responseTimeSeconds,
        client_submission_id: `sub_${Date.now()}`
      })
    });
    return handleResponse<any>(res);
  },

  finishInterview: async (sessionId: string): Promise<InterviewSession> => {
    const res = await fetch(`${API_BASE}/interviews/${sessionId}/finish`, {
      method: 'POST',
      headers: { ...getAuthHeader() }
    });
    return handleResponse<InterviewSession>(res);
  },

  // Reports
  getSessionReport: async (sessionId: string): Promise<InterviewReport> => {
    const res = await fetch(`${API_BASE}/interviews/${sessionId}/report`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse<InterviewReport>(res);
  },

  listReports: async (): Promise<InterviewReport[]> => {
    const res = await fetch(`${API_BASE}/reports`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse<InterviewReport[]>(res);
  },

  getReportById: async (reportId: string): Promise<InterviewReport> => {
    const res = await fetch(`${API_BASE}/reports/${reportId}`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse<InterviewReport>(res);
  }
};
