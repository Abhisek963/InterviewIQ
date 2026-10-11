import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { Resume } from '../../types';
import {
  Play, FileText, AlertCircle, Building2, ChevronRight,
  Clock, Cpu, Users, Brain, Layers, Code2
} from 'lucide-react';

const ROLE_PRESETS = [
  { label: 'Software Engineer', value: 'Software Engineer' },
  { label: 'Backend Developer', value: 'Backend Developer' },
  { label: 'Frontend Developer', value: 'Frontend Developer' },
  { label: 'Data Analyst', value: 'Data Analyst' },
  { label: 'AI/ML Engineer', value: 'AI/ML Engineer' },
  { label: 'Product Manager', value: 'Product Manager' },
];

const INTERVIEW_TYPES = [
  { id: 'technical',  label: 'Technical',  icon: <Code2 size={14} />,   desc: 'Data structures, algorithms, system design' },
  { id: 'behavioral', label: 'Behavioral', icon: <Brain size={14} />,   desc: 'STAR method, teamwork, decision-making' },
  { id: 'HR',         label: 'HR Round',   icon: <Users size={14} />,   desc: 'Culture fit, goals, background' },
  { id: 'mixed',      label: 'Mixed',      icon: <Layers size={14} />,  desc: 'Technical + behavioural' },
];

const DIFFICULTIES = [
  { id: 'beginner',     label: 'Beginner',      desc: 'Campus entry-level' },
  { id: 'intermediate', label: 'Intermediate',  desc: 'SDE-1 / standard' },
  { id: 'advanced',     label: 'Advanced',       desc: 'Deep dive & architecture' },
];

const DURATIONS = [
  { dur: 10, count: 5,  label: '10 min',  sub: '5 questions' },
  { dur: 20, count: 7,  label: '20 min',  sub: '7 questions' },
  { dur: 30, count: 10, label: '30 min',  sub: '10 questions' },
];

export const InterviewConfigPage: React.FC = () => {
  const navigate = useNavigate();

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('Software Engineer');
  const [interviewType, setInterviewType] = useState<'HR' | 'technical' | 'behavioral' | 'mixed'>('technical');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [duration, setDuration] = useState<number>(20);

  const [loading, setLoading] = useState(false);
  const [fetchingResumes, setFetchingResumes] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchResumes() {
      try {
        const list = await api.listResumes();
        const readyList = list.filter((r) => r.status === 'ready');
        setResumes(readyList);
        if (readyList.length > 0) setSelectedResumeId(readyList[0].id);
      } catch {
        setError('Failed to fetch uploaded resumes.');
      } finally {
        setFetchingResumes(false);
      }
    }
    fetchResumes();
  }, []);

  const handleStartInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResumeId) {
      setError('Please upload and select a resume before starting.');
      return;
    }
    if (!jobTitle) {
      setError('Job title is required.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const session = await api.createInterview({
        resume_id: selectedResumeId,
        company_name: companyName || 'General',
        job_title: jobTitle,
        interview_type: interviewType,
        difficulty,
        duration_minutes: duration,
      });
      await api.startInterview(session.id);
      navigate(`/interview/room/${session.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create interview session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: 'var(--color-paper)', minHeight: 'calc(100vh - 3.5rem)' }}>
      <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-12)', maxWidth: '800px' }}>

        {/* Header */}
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <span className="eyebrow" style={{ display: 'block', marginBottom: 'var(--space-3)' }}>
            Interview setup
          </span>
          <h1
            style={{
              margin: '0 0 var(--space-3)',
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              fontFamily: 'var(--font-serif)',
              fontWeight: 400,
              lineHeight: 1.2,
              color: 'var(--color-ink)',
            }}
          >
            Configure your mock interview
          </h1>
          <p style={{ margin: 0, fontSize: '0.9375rem', color: 'var(--color-muted)' }}>
            Set your target role, select your resume, and choose your session parameters.
          </p>
        </div>

        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.875rem 1rem',
              background: '#FEF2F2',
              border: '1px solid rgba(185,56,50,0.2)',
              borderRadius: '6px',
              marginBottom: 'var(--space-6)',
              fontSize: '0.9rem',
              color: 'var(--color-error)',
            }}
          >
            <AlertCircle size={15} />
            {error}
          </div>
        )}

        <form onSubmit={handleStartInterview} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>

          {/* ─ 1. RESUME ──────────────────────────────────────────────── */}
          <section
            style={{
              background: 'var(--color-white)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              padding: 'var(--space-6)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: 'var(--space-5)', paddingBottom: 'var(--space-4)', borderBottom: '1px solid var(--color-border)' }}>
              <span className="mono-label" style={{ color: 'var(--color-forest)', background: 'var(--color-forest-light)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>01</span>
              <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--color-ink)' }}>
                <FileText size={15} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.5rem', color: 'var(--color-muted)' }} />
                Resume context
              </h2>
            </div>

            {fetchingResumes ? (
              <p className="mono-label text-muted">Loading resumes…</p>
            ) : resumes.length === 0 ? (
              <div
                style={{
                  padding: 'var(--space-5)',
                  background: 'var(--color-paper)',
                  border: '1px solid var(--color-border)',
                  borderLeft: '3px solid #C49A20',
                  borderRadius: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-3)',
                }}
              >
                <p style={{ margin: 0, fontWeight: 600, color: 'var(--color-ink)', fontSize: '0.9375rem' }}>No ready resume found</p>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-muted)', lineHeight: 1.6 }}>
                  Upload a PDF or DOCX resume so the AI can build questions around your actual projects and skills.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/resumes')}
                  className="btn btn-outline btn-sm"
                  style={{ alignSelf: 'flex-start' }}
                >
                  Go to Resume Manager <ChevronRight size={13} />
                </button>
              </div>
            ) : (
              <div>
                <label className="form-label" htmlFor="resume-select">Select resume</label>
                <select
                  id="resume-select"
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="form-select"
                >
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.original_filename} ({r.parsed_profile?.skills?.length || 0} skills extracted)
                    </option>
                  ))}
                </select>
              </div>
            )}
          </section>

          {/* ─ 2. ROLE & COMPANY ──────────────────────────────────────── */}
          <section
            style={{
              background: 'var(--color-white)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              padding: 'var(--space-6)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: 'var(--space-5)', paddingBottom: 'var(--space-4)', borderBottom: '1px solid var(--color-border)' }}>
              <span className="mono-label" style={{ color: 'var(--color-forest)', background: 'var(--color-forest-light)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>02</span>
              <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--color-ink)' }}>
                <Building2 size={15} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.5rem', color: 'var(--color-muted)' }} />
                Role &amp; Company
              </h2>
            </div>

            {/* Role presets */}
            <div style={{ marginBottom: 'var(--space-5)' }}>
              <label className="form-label">Quick role presets</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                {ROLE_PRESETS.map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setJobTitle(role.value)}
                    style={{
                      padding: '0.4rem 0.875rem',
                      border: `1.5px solid ${jobTitle === role.value ? 'var(--color-forest)' : 'var(--color-border)'}`,
                      borderRadius: 'var(--radius-lg)',
                      background: jobTitle === role.value ? 'var(--color-forest-light)' : 'var(--color-white)',
                      color: jobTitle === role.value ? 'var(--color-forest)' : 'var(--color-muted)',
                      fontSize: '0.8125rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                      fontFamily: 'var(--font-sans)',
                    }}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }} className="role-grid">
              <div>
                <label className="form-label" htmlFor="job-title">Job title / Role</label>
                <input
                  id="job-title"
                  type="text"
                  required
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Software Engineer"
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label" htmlFor="company-name">
                  Target company <span style={{ color: 'var(--color-muted)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
                </label>
                <input
                  id="company-name"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Google, Infosys, Startup"
                  className="form-input"
                />
              </div>
            </div>
          </section>

          {/* ─ 3. SESSION PARAMETERS ─────────────────────────────────── */}
          <section
            style={{
              background: 'var(--color-white)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              padding: 'var(--space-6)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: 'var(--space-5)', paddingBottom: 'var(--space-4)', borderBottom: '1px solid var(--color-border)' }}>
              <span className="mono-label" style={{ color: 'var(--color-forest)', background: 'var(--color-forest-light)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>03</span>
              <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--color-ink)' }}>
                <Cpu size={15} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.5rem', color: 'var(--color-muted)' }} />
                Session parameters
              </h2>
            </div>

            {/* Interview type */}
            <div style={{ marginBottom: 'var(--space-5)' }}>
              <label className="form-label">Interview type</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-3)' }} className="type-grid">
                {INTERVIEW_TYPES.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setInterviewType(type.id as any)}
                    className={`option-card${interviewType === type.id ? ' selected' : ''}`}
                    style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', textAlign: 'left', cursor: 'pointer' }}
                  >
                    <span style={{ color: interviewType === type.id ? 'var(--color-forest)' : 'var(--color-muted)' }}>{type.icon}</span>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-ink)', display: 'block' }}>{type.label}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', lineHeight: 1.4 }}>{type.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div style={{ marginBottom: 'var(--space-5)' }}>
              <label className="form-label">Difficulty</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)' }}>
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDifficulty(d.id as any)}
                    className={`option-card${difficulty === d.id ? ' selected' : ''}`}
                    style={{ textAlign: 'center', cursor: 'pointer' }}
                  >
                    <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-ink)', display: 'block' }}>{d.label}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>{d.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="form-label">
                <Clock size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.375rem' }} />
                Duration
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)' }}>
                {DURATIONS.map((d) => (
                  <button
                    key={d.dur}
                    type="button"
                    onClick={() => setDuration(d.dur)}
                    className={`option-card${duration === d.dur ? ' selected' : ''}`}
                    style={{ textAlign: 'center', cursor: 'pointer' }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '1.5rem',
                        lineHeight: 1,
                        color: duration === d.dur ? 'var(--color-forest)' : 'var(--color-ink)',
                        display: 'block',
                        marginBottom: '0.25rem',
                      }}
                    >
                      {d.label}
                    </span>
                    <span className="mono-label text-muted">{d.sub}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !selectedResumeId}
            aria-busy={loading}
            className="btn btn-primary btn-xl"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {loading ? (
              <>
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
                Creating session…
              </>
            ) : (
              <>
                <Play size={17} strokeWidth={3} />
                Launch interview
              </>
            )}
          </button>
        </form>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .role-grid { grid-template-columns: 1fr !important; }
          .type-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
};
