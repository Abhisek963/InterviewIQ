import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { api } from '../../lib/api';
import { InterviewSession, Resume, InterviewReport } from '../../types';
import { Badge, ProgressBar } from '../../components/ui/Card';
import {
  Play, FileText, History, Trophy, BarChart2,
  CheckCircle, ArrowRight, ChevronRight, Plus, Clock
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [reports, setReports] = useState<InterviewReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [sList, rList, repList] = await Promise.all([
          api.listInterviews(),
          api.listResumes(),
          api.listReports(),
        ]);
        setSessions(sList);
        setResumes(rList);
        setReports(repList);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const completedSessions = sessions.filter((s) => s.status === 'completed');
  const validScores = reports
    .map((r) => r.overall_score)
    .filter((s): s is number => s !== undefined && s !== null);
  const avgScore =
    validScores.length > 0
      ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
      : null;

  const readinessLabel =
    avgScore === null
      ? 'No data yet'
      : avgScore >= 80
      ? 'High readiness'
      : avgScore >= 60
      ? 'Moderate'
      : 'Building';

  return (
    <div style={{ background: 'var(--color-paper)', minHeight: 'calc(100vh - 3.5rem)' }}>
      <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-12)' }}>

        {/* ── TOP BAR ───────────────────────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 'var(--space-4)',
            marginBottom: 'var(--space-8)',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <p className="eyebrow" style={{ marginBottom: 'var(--space-2)' }}>
              {user?.college_name || 'Practice Hub'}
            </p>
            <h1
              style={{
                margin: 0,
                fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                fontFamily: 'var(--font-serif)',
                fontWeight: 400,
                lineHeight: 1.2,
                color: 'var(--color-ink)',
              }}
            >
              Welcome back, {user?.full_name?.split(' ')[0] || 'Candidate'}.
            </h1>
          </div>
          <Link to="/interview/new" className="btn btn-primary btn-lg">
            <Play size={15} strokeWidth={3} />
            Start new interview
          </Link>
        </div>

        {/* ── METRIC ROW ────────────────────────────────────────────────── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 'var(--space-4)',
            marginBottom: 'var(--space-8)',
          }}
          className="metric-grid"
        >
          {[
            {
              icon: <Trophy size={18} />,
              label: 'Average score',
              value: avgScore !== null ? `${avgScore}` : '—',
              sub: avgScore !== null ? '/ 100' : 'No sessions yet',
              accent: 'var(--color-forest)',
            },
            {
              icon: <CheckCircle size={18} />,
              label: 'Completed sessions',
              value: String(completedSessions.length),
              sub: sessions.length > 0 ? `of ${sessions.length} total` : 'Start practising',
              accent: 'var(--color-success)',
            },
            {
              icon: <FileText size={18} />,
              label: 'Parsed resumes',
              value: String(resumes.filter((r) => r.status === 'ready').length),
              sub: resumes.length > 0 ? `${resumes.length} uploaded` : 'Upload a resume',
              accent: '#C49A20',
            },
            {
              icon: <BarChart2 size={18} />,
              label: 'Placement readiness',
              value: avgScore !== null ? (avgScore >= 80 ? '↑' : avgScore >= 60 ? '~' : '↗') : '—',
              sub: readinessLabel,
              accent: 'var(--color-forest)',
            },
          ].map((metric, i) => (
            <div
              key={i}
              style={{
                background: 'var(--color-white)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                padding: 'var(--space-5)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
                <span style={{ color: metric.accent }}>{metric.icon}</span>
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '2.25rem',
                  lineHeight: 1,
                  color: 'var(--color-ink)',
                  marginBottom: '0.25rem',
                }}
              >
                {metric.value}
              </div>
              <p className="mono-label text-muted" style={{ marginBottom: '2px' }}>{metric.label}</p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', margin: 0 }}>{metric.sub}</p>
            </div>
          ))}
        </div>

        {/* ── MAIN CONTENT ──────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-6)' }} className="dash-grid">

          {/* Recent Sessions */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 'var(--space-4)',
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: '1.0625rem',
                  fontWeight: 600,
                  color: 'var(--color-ink)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <History size={16} color="var(--color-muted)" />
                Recent interviews
              </h2>
              <Link
                to="/history"
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  color: 'var(--color-forest)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  textDecoration: 'none',
                }}
              >
                View all <ArrowRight size={13} />
              </Link>
            </div>

            {loading ? (
              <div style={{ padding: 'var(--space-8)', textAlign: 'center', background: 'var(--color-white)', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
                <p className="mono-label text-muted">Loading sessions…</p>
              </div>
            ) : sessions.length === 0 ? (
              /* Empty state */
              <div
                style={{
                  background: 'var(--color-white)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  padding: 'var(--space-10)',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 'var(--space-4)',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    background: 'var(--color-forest-light)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Play size={20} color="var(--color-forest)" />
                </div>
                <div>
                  <h3 style={{ margin: '0 0 var(--space-2)', fontWeight: 600, color: 'var(--color-ink)' }}>
                    No interviews yet
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-muted)', maxWidth: '320px' }}>
                    Upload a resume, choose your target role, and complete your first AI mock interview.
                  </p>
                </div>
                <Link to={resumes.length === 0 ? '/resumes' : '/interview/new'} className="btn btn-primary btn-sm">
                  {resumes.length === 0 ? 'Upload resume first' : 'Start your first interview'}
                  <ChevronRight size={13} />
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {sessions.slice(0, 5).map((session) => {
                  const report = reports.find((r) => r.session_id === session.id);
                  const statusColors: Record<string, string> = {
                    completed: 'var(--color-success)',
                    in_progress: '#C49A20',
                    created: 'var(--color-muted)',
                    abandoned: 'var(--color-error)',
                  };

                  return (
                    <div
                      key={session.id}
                      style={{
                        background: 'var(--color-white)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '8px',
                        padding: 'var(--space-4) var(--space-5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 'var(--space-4)',
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--color-ink)' }}>
                            {session.company_name}
                          </span>
                          <span style={{ color: 'var(--color-border)' }}>·</span>
                          <span style={{ fontSize: '0.875rem', color: 'var(--color-muted)' }}>{session.job_title}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.625rem',
                              fontWeight: 600,
                              letterSpacing: '0.08em',
                              textTransform: 'uppercase',
                              color: statusColors[session.status] || 'var(--color-muted)',
                            }}
                          >
                            {session.status.replace('_', ' ')}
                          </span>
                          <span style={{ color: 'var(--color-border)', fontSize: '0.75rem' }}>·</span>
                          <span style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Clock size={11} />
                            {session.duration_minutes}m
                          </span>
                          <span style={{ fontSize: '0.8125rem', color: 'var(--color-muted)' }}>
                            {session.interview_type}
                          </span>
                        </div>
                      </div>

                      <div style={{ flexShrink: 0 }}>
                        {session.status === 'completed' && report ? (
                          <Link
                            to={`/report/${session.id}`}
                            className="btn btn-outline btn-sm"
                            style={{ gap: '0.375rem' }}
                          >
                            <Trophy size={12} color="var(--color-forest)" />
                            {report.overall_score ?? '—'}/100
                          </Link>
                        ) : (
                          <Link
                            to={`/interview/room/${session.id}`}
                            className="btn btn-primary btn-sm"
                          >
                            {session.status === 'in_progress' ? 'Resume' : 'Start'}
                            <Play size={11} strokeWidth={3} />
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            {/* Resume status */}
            <div
              style={{
                background: 'var(--color-white)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                padding: 'var(--space-5)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-ink)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={14} color="var(--color-muted)" />
                  Resumes
                </h3>
                <Link to="/resumes" className="btn btn-ghost btn-sm" style={{ padding: '0.25rem 0.5rem' }}>
                  <Plus size={13} />
                  Add
                </Link>
              </div>

              {resumes.length === 0 ? (
                <div
                  style={{
                    padding: 'var(--space-4)',
                    background: 'var(--color-paper)',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border)',
                    fontSize: '0.8125rem',
                    color: 'var(--color-muted)',
                    lineHeight: 1.6,
                  }}
                >
                  <p style={{ margin: '0 0 var(--space-3)', fontWeight: 600, color: 'var(--color-ink)' }}>
                    No resume uploaded
                  </p>
                  <p style={{ margin: '0 0 var(--space-3)' }}>
                    Upload a PDF or DOCX so the AI can build questions around your actual projects.
                  </p>
                  <Link to="/resumes" style={{ color: 'var(--color-forest)', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '2px' }}>
                    Upload now →
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  {resumes.slice(0, 3).map((r) => (
                    <div
                      key={r.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.625rem 0.875rem',
                        background: 'var(--color-paper)',
                        borderRadius: '6px',
                        border: '1px solid var(--color-border)',
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <p
                          style={{
                            margin: 0,
                            fontSize: '0.8125rem',
                            fontWeight: 500,
                            color: 'var(--color-ink)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '160px',
                          }}
                        >
                          {r.original_filename}
                        </p>
                        <p className="mono-label text-muted" style={{ marginTop: '2px' }}>
                          {r.parsed_profile?.skills?.length || 0} skills
                        </p>
                      </div>
                      <Badge variant={r.status === 'ready' ? 'forest' : 'muted'}>
                        {r.status}
                      </Badge>
                    </div>
                  ))}
                  <Link
                    to="/resumes"
                    style={{
                      fontSize: '0.8125rem',
                      color: 'var(--color-forest)',
                      fontWeight: 500,
                      textAlign: 'center',
                      padding: 'var(--space-2)',
                      display: 'block',
                      textDecoration: 'none',
                    }}
                  >
                    Manage resumes →
                  </Link>
                </div>
              )}
            </div>

            {/* Score breakdown if data exists */}
            {reports.length > 0 && avgScore !== null && (
              <div
                style={{
                  background: 'var(--color-ink)',
                  color: 'var(--color-white)',
                  borderRadius: '8px',
                  padding: 'var(--space-5)',
                }}
              >
                <p className="mono-label" style={{ color: 'var(--color-lime)', marginBottom: 'var(--space-3)' }}>
                  YOUR AVERAGE SCORE
                </p>
                <div
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '3.5rem',
                    lineHeight: 1,
                    marginBottom: 'var(--space-3)',
                  }}
                >
                  {avgScore}
                  <span style={{ fontSize: '1.25rem', opacity: 0.5 }}>/100</span>
                </div>
                <div className="progress-track" style={{ height: '6px', background: 'rgba(255,255,255,0.1)' }}>
                  <div
                    className="progress-fill"
                    style={{ width: `${avgScore}%`, background: 'var(--color-lime)' }}
                  />
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.55)', marginTop: 'var(--space-3)', marginBottom: 0 }}>
                  Based on {completedSessions.length} completed {completedSessions.length === 1 ? 'interview' : 'interviews'}
                </p>
              </div>
            )}

            {/* Practice tip */}
            <div
              style={{
                background: 'var(--color-forest-light)',
                border: '1px solid rgba(23,76,60,0.15)',
                borderRadius: '8px',
                padding: 'var(--space-5)',
              }}
            >
              <p className="mono-label" style={{ color: 'var(--color-forest)', marginBottom: 'var(--space-2)' }}>
                TIP
              </p>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.65, color: 'var(--color-ink)', margin: 0 }}>
                Use 20-minute Technical sessions to practise time management before real campus interviews. 
                Aim for 30+ words per answer.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive grid styles */}
      <style>{`
        @media (max-width: 1024px) {
          .metric-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .dash-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .metric-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  );
};
