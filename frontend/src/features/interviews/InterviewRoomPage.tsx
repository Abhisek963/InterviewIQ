import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { InterviewSession, InterviewQuestion, AnswerFeedback } from '../../types';
import { Send, AlertTriangle, CheckCircle, XCircle, Clock, ChevronRight } from 'lucide-react';

/* ─── Elapsed Timer ───────────────────────────────────────────────────────── */
function ElapsedTimer({ startedAt }: { startedAt?: string }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const base = startedAt ? Date.now() - new Date(startedAt).getTime() : 0;
    setElapsed(Math.floor(base / 1000));
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const ss = String(elapsed % 60).padStart(2, '0');

  return (
    <span className="timer timer-active">
      <Clock size={11} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
      {mm}:{ss}
    </span>
  );
}

/* ─── Interview Room ──────────────────────────────────────────────────────── */
export const InterviewRoomPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [session, setSession] = useState<InterviewSession | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [lastFeedback, setLastFeedback] = useState<AnswerFeedback | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [submitStartTime, setSubmitStartTime] = useState<number | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const loadSessionState = useCallback(async (sid: string) => {
    setLoading(true);
    setError('');
    try {
      const s = await api.getInterviewSession(sid);
      setSession(s);
      if (s.status === 'completed') {
        navigate(`/report/${sid}`);
        return;
      }
      const q = await api.getCurrentQuestion(sid);
      setCurrentQuestion(q);
    } catch (err: any) {
      setError(err.message || 'Failed to load interview session');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (sessionId) loadSessionState(sessionId);
  }, [sessionId, loadSessionState]);

  // Focus textarea when question loads
  useEffect(() => {
    if (!loading && currentQuestion) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [loading, currentQuestion]);

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerText.trim() || !sessionId || submitting) return;

    const responseTime = submitStartTime ? Math.round((Date.now() - submitStartTime) / 1000) : undefined;

    setError('');
    setSubmitting(true);
    try {
      const res = await api.submitAnswer(sessionId, answerText.trim(), responseTime);

      // Capture feedback for display
      if (res.evaluation?.feedback) {
        setLastFeedback({
          score: res.evaluation.score,
          dimension_scores: res.evaluation.dimension_scores,
          ...res.evaluation.feedback,
        });
      } else if (res.evaluation) {
        setLastFeedback(res.evaluation);
      }

      setAnswerText('');
      setSubmitStartTime(null);

      if (res.is_final || res.status === 'completed') {
        navigate(`/report/${sessionId}`);
      } else {
        const [s, nextQ] = await Promise.all([
          api.getInterviewSession(sessionId),
          api.getCurrentQuestion(sessionId),
        ]);
        setSession(s);
        setCurrentQuestion(nextQ);
        setSubmitStartTime(Date.now());
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit answer. Your response is preserved — please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinishEarly = async () => {
    if (!sessionId) return;
    setSubmitting(true);
    try {
      await api.finishInterview(sessionId);
      navigate(`/report/${sessionId}`);
    } catch {
      setError('Failed to finish interview session');
    } finally {
      setSubmitting(false);
    }
  };

  /* ─── Loading State ────────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div
        style={{
          minHeight: 'calc(100vh - 3.5rem)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-4)',
          background: 'var(--color-paper)',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            background: 'var(--color-lime)',
            borderRadius: '8px',
            animation: 'pulse-lime 1.4s ease-in-out infinite',
          }}
        />
        <p className="mono-label text-muted" style={{ letterSpacing: '0.1em' }}>LOADING INTERVIEW SESSION…</p>
      </div>
    );
  }

  /* ─── Error / Not Found State ──────────────────────────────────────────── */
  if (!session || !currentQuestion) {
    return (
      <div
        style={{
          maxWidth: '480px',
          margin: '0 auto',
          padding: 'var(--space-16) var(--space-6)',
          textAlign: 'center',
        }}
      >
        <AlertTriangle size={40} color="#C49A20" style={{ marginBottom: 'var(--space-4)' }} />
        <h2 style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--color-ink)', marginBottom: 'var(--space-3)' }}>
          Session not found
        </h2>
        <p style={{ color: 'var(--color-muted)', marginBottom: 'var(--space-6)' }}>
          The interview session could not be retrieved.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
          Return to dashboard
        </button>
      </div>
    );
  }

  const totalQuestions = session.question_plan?.length || session.total_planned_questions || 5;
  const currentSeq = currentQuestion.sequence_number;
  const pct = Math.round((currentSeq / totalQuestions) * 100);
  const wordCount = answerText.trim() ? answerText.trim().split(/\s+/).length : 0;
  const isFinalQuestion = currentSeq === totalQuestions;

  return (
    <div
      style={{
        background: 'var(--color-paper)',
        minHeight: 'calc(100vh - 3.5rem)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ─── Top bar ──────────────────────────────────────────────────── */}
      <div
        style={{
          background: 'var(--color-room-bar)',
          borderBottom: '1px solid var(--color-border)',
          padding: '0.75rem var(--space-5)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-4)',
          position: 'sticky',
          top: '3.5rem',
          zIndex: 10,
        }}
      >
        {/* Session identity */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6875rem',
              fontWeight: 600,
              color: 'rgba(255,255,255,0.4)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}
          >
            {session.interview_type.toUpperCase()}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
          <span
            style={{
              fontWeight: 500,
              fontSize: '0.875rem',
              color: 'var(--color-white)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {session.company_name !== 'General' ? `${session.company_name} — ` : ''}{session.job_title}
          </span>
        </div>

        {/* Timer */}
        <ElapsedTimer startedAt={session.started_at} />

        {/* Progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="mono-label" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {currentSeq}/{totalQuestions}
          </span>
          <div
            style={{
              width: '80px',
              height: '3px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '2px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${pct}%`,
                background: 'var(--color-lime)',
                borderRadius: '2px',
                transition: 'width 0.4s ease',
              }}
            />
          </div>
        </div>

        {/* Exit */}
        <button
          onClick={() => setShowExitConfirm(true)}
          style={{
            background: 'none',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            padding: '0.3rem 0.75rem',
            color: 'rgba(255,255,255,0.55)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6875rem',
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            transition: 'all var(--transition-fast)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; }}
        >
          Finish
        </button>
      </div>

      {/* ─── Main content ─────────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          maxWidth: '760px',
          width: '100%',
          margin: '0 auto',
          padding: 'var(--space-8) var(--space-5)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-5)',
        }}
      >
        {/* Error banner */}
        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.625rem',
              padding: '0.875rem 1rem',
              background: '#FEF2F2',
              border: '1px solid rgba(185,56,50,0.2)',
              borderRadius: '6px',
              fontSize: '0.875rem',
              color: 'var(--color-error)',
            }}
          >
            <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: '1px' }} />
            <span>{error}</span>
          </div>
        )}

        {/* Previous answer feedback */}
        {lastFeedback && (
          <div
            style={{
              padding: 'var(--space-4) var(--space-5)',
              background: 'var(--color-white)',
              border: '1px solid var(--color-border)',
              borderLeft: `3px solid ${lastFeedback.score >= 70 ? 'var(--color-success)' : lastFeedback.score >= 50 ? '#C49A20' : 'var(--color-error)'}`,
              borderRadius: '6px',
              display: 'flex',
              gap: 'var(--space-4)',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
            }}
            className="animate-fade-in"
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                {lastFeedback.score >= 70 ? (
                  <CheckCircle size={14} color="var(--color-success)" />
                ) : (
                  <XCircle size={14} color="var(--color-error)" />
                )}
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.08em', color: 'var(--color-muted)', textTransform: 'uppercase' }}>
                  Previous answer
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.75rem',
                    lineHeight: 1,
                    color: lastFeedback.score >= 70 ? 'var(--color-success)' : lastFeedback.score >= 50 ? '#C49A20' : 'var(--color-error)',
                  }}
                >
                  {lastFeedback.score}
                </span>
                <span className="mono-label text-muted">/100</span>
              </div>
              {lastFeedback.strengths?.[0] && (
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-success)', margin: '0.375rem 0 0' }}>
                  ✓ {lastFeedback.strengths[0]}
                </p>
              )}
              {lastFeedback.improvements?.[0] && (
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', margin: '0.25rem 0 0' }}>
                  ↑ {lastFeedback.improvements[0]}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Question card */}
        <div
          style={{
            background: 'var(--color-white)',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          {/* Question header */}
          <div
            style={{
              padding: 'var(--space-4) var(--space-5)',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.5rem',
              background: 'var(--color-paper)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--color-forest)',
                  background: 'var(--color-forest-light)',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  letterSpacing: '0.04em',
                }}
              >
                Q{String(currentSeq).padStart(2, '0')}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--color-muted)',
                }}
              >
                {currentQuestion.category}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  color: 'var(--color-muted)',
                }}
              >
                {currentQuestion.topic}
              </span>
            </div>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                color: 'var(--color-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              {currentQuestion.difficulty}
            </span>
          </div>

          {/* Question text */}
          <div style={{ padding: 'var(--space-6) var(--space-5)' }}>
            <p
              style={{
                margin: 0,
                fontSize: 'clamp(1rem, 2.5vw, 1.1875rem)',
                lineHeight: 1.65,
                color: 'var(--color-ink)',
                fontWeight: 500,
              }}
            >
              {currentQuestion.question_text}
            </p>
            <p
              style={{
                margin: 'var(--space-3) 0 0',
                fontSize: '0.8125rem',
                color: 'var(--color-muted)',
                fontStyle: 'italic',
              }}
            >
              Be specific, explain trade-offs, and structure your answer clearly.
            </p>
          </div>

          {/* Answer form */}
          <form onSubmit={handleSubmitAnswer} style={{ padding: '0 var(--space-5) var(--space-5)' }}>
            <div style={{ marginBottom: 'var(--space-3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                <label htmlFor="answer-textarea" className="form-label" style={{ marginBottom: 0 }}>
                  Your response
                </label>
                <span
                  className="mono-label"
                  style={{
                    color: wordCount === 0 ? 'var(--color-border)' : wordCount < 20 ? '#C49A20' : 'var(--color-success)',
                  }}
                >
                  {wordCount} {wordCount === 1 ? 'word' : 'words'}
                  {wordCount > 0 && wordCount < 20 && ' — aim for 30+'}
                </span>
              </div>
              <textarea
                id="answer-textarea"
                ref={textareaRef}
                rows={8}
                required
                value={answerText}
                onChange={(e) => {
                  setAnswerText(e.target.value);
                  if (!submitStartTime && e.target.value.length === 1) setSubmitStartTime(Date.now());
                }}
                disabled={submitting}
                placeholder="Type your response here…"
                className="interview-answer"
                style={{ width: '100%', minHeight: '180px' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-muted)', fontStyle: 'italic' }}>
                Submitting records and evaluates your response.
              </p>
              <button
                type="submit"
                disabled={!answerText.trim() || submitting}
                aria-busy={submitting}
                className="btn btn-primary btn-lg"
                style={{ gap: '0.5rem' }}
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                    Evaluating…
                  </>
                ) : (
                  <>
                    {isFinalQuestion ? 'Submit final answer' : 'Submit & next question'}
                    <Send size={14} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Question progression dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
          {Array.from({ length: totalQuestions }).map((_, i) => (
            <div
              key={i}
              style={{
                width: i + 1 === currentSeq ? '20px' : '6px',
                height: '6px',
                borderRadius: '3px',
                background: i + 1 < currentSeq
                  ? 'var(--color-forest)'
                  : i + 1 === currentSeq
                  ? 'var(--color-lime)'
                  : 'var(--color-border)',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>
      </div>

      {/* ─── Exit Confirm Modal ────────────────────────────────────────── */}
      {showExitConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            background: 'rgba(25, 26, 25, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-5)',
          }}
          onClick={() => setShowExitConfirm(false)}
        >
          <div
            style={{
              background: 'var(--color-white)',
              borderRadius: '8px',
              maxWidth: '440px',
              width: '100%',
              padding: 'var(--space-7)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 var(--space-3)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-ink)' }}>
              Finish interview early?
            </h3>
            <p style={{ margin: '0 0 var(--space-5)', fontSize: '0.9rem', color: 'var(--color-muted)', lineHeight: 1.6 }}>
              Ending early will evaluate all answers submitted so far and generate your performance report. 
              You have completed {currentSeq - 1} of {totalQuestions} questions.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setShowExitConfirm(false)}
              >
                Continue interview
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={handleFinishEarly}
                disabled={submitting}
                aria-busy={submitting}
              >
                {submitting ? 'Finishing…' : 'Finish & view report'}
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
