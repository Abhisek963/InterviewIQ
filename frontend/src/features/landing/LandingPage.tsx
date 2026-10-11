import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, ChevronRight, Send, Clock, FileText,
  Target, CheckCircle, AlertCircle, Star, Zap, Users, Code2
} from 'lucide-react';

/* ─── Demo Data ───────────────────────────────────────────────────────────── */
const DEMO_QUESTION = {
  number: '01',
  role: 'Software Engineer',
  type: 'Technical',
  topic: 'Data Structures',
  text: "You've used a dictionary in Python. What is its average-case lookup complexity, and when might performance degrade?",
};

const DEMO_EVALUATION = (answer: string) => {
  const len = answer.trim().split(/\s+/).length;
  const mentionedO1 = /o\(1\)|constant|hash/i.test(answer);
  const mentionedCollision = /collision|worst.case|o\(n\)|rehash/i.test(answer);

  let score = 40;
  if (len >= 10) score += 15;
  if (len >= 25) score += 10;
  if (mentionedO1) score += 20;
  if (mentionedCollision) score += 15;

  return {
    score: Math.min(score, 100),
    strengths: mentionedO1
      ? ['Correctly identified O(1) average-case complexity']
      : ['Attempted to engage with the question directly'],
    gaps: mentionedCollision
      ? []
      : ['Did not mention hash collision as a degradation cause', 'Missing worst-case O(n) scenario'],
    ideal: "Python dict uses a hash table. Average-case lookup is O(1). Performance degrades to O(n) when many keys hash to the same bucket — i.e. during excessive hash collisions — which forces linear probing. Modern Python (3.6+) mitigates this with a compact dict implementation and random hash seeds.",
  };
};

const ROLE_PRESETS = [
  { id: 'swe', label: 'Software Engineer', icon: <Code2 size={13} /> },
  { id: 'backend', label: 'Backend Developer', icon: <Target size={13} /> },
  { id: 'frontend', label: 'Frontend Developer', icon: <Zap size={13} /> },
  { id: 'data', label: 'Data Analyst', icon: <Star size={13} /> },
  { id: 'ml', label: 'AI/ML Engineer', icon: <CheckCircle size={13} /> },
  { id: 'hr', label: 'HR Interview', icon: <Users size={13} /> },
];

/* ─── Sub-components ─────────────────────────────────────────────────────── */

/** Animated timer display */
function DemoTimer({ running }: { running: boolean }) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  return (
    <span className="timer timer-active">
      <Clock size={11} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
      {mm}:{ss}
    </span>
  );
}

/** The interactive demo panel (right side of hero) */
function InterviewPreview() {
  const [phase, setPhase] = useState<'idle' | 'answering' | 'submitted' | 'evaluated'>('idle');
  const [answer, setAnswer] = useState('');
  const [evaluation, setEvaluation] = useState<ReturnType<typeof DEMO_EVALUATION> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const wordCount = answer.trim() ? answer.trim().split(/\s+/).length : 0;

  const handleStart = () => {
    setPhase('answering');
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const handleSubmit = () => {
    if (!answer.trim()) return;
    setPhase('submitted');
    setTimeout(() => {
      setEvaluation(DEMO_EVALUATION(answer));
      setPhase('evaluated');
    }, 900);
  };

  const handleReset = () => {
    setPhase('idle');
    setAnswer('');
    setEvaluation(null);
  };

  return (
    <div
      style={{
        background: 'var(--color-white)',
        border: '1px solid var(--color-border)',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 4px 32px rgba(25, 26, 25, 0.08)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Panel header */}
      <div
        style={{
          background: 'var(--color-contrast-section)',
          padding: '0.875rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '5px' }}>
            {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
              <div key={c} style={{ width: '8px', height: '8px', borderRadius: '50%', background: c }} />
            ))}
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.06em' }}>
            DEMO SESSION · NOT SAVED
          </span>
        </div>
        {phase === 'answering' && <DemoTimer running />}
        {phase !== 'answering' && (
          <span className="badge badge-muted" style={{ fontSize: '0.625rem', background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)' }}>
            {DEMO_QUESTION.type}
          </span>
        )}
      </div>

      <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
        {/* Session meta */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="badge badge-forest">{DEMO_QUESTION.role}</span>
            <span className="badge badge-muted">{DEMO_QUESTION.topic}</span>
          </div>
          <span className="mono-label text-muted">Q{DEMO_QUESTION.number}</span>
        </div>

        {/* Question */}
        <div
          style={{
            padding: '1rem 1.125rem',
            background: 'var(--color-paper)',
            borderRadius: '6px',
            border: '1px solid var(--color-border)',
            borderLeft: '3px solid var(--color-forest)',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.9375rem',
              lineHeight: 1.65,
              color: 'var(--color-ink)',
              margin: 0,
            }}
          >
            {DEMO_QUESTION.text}
          </p>
        </div>

        {/* Idle state */}
        {phase === 'idle' && (
          <button
            onClick={handleStart}
            className="btn btn-primary"
            style={{ justifyContent: 'center', marginTop: 'auto' }}
          >
            <Send size={14} />
            Try answering this question
          </button>
        )}

        {/* Answering state */}
        {phase === 'answering' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Your answer</label>
              <span
                className="mono-label"
                style={{ color: wordCount < 15 ? 'var(--color-muted)' : 'var(--color-success)' }}
              >
                {wordCount} words
              </span>
            </div>
            <textarea
              ref={textareaRef}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={5}
              className="interview-answer"
              placeholder="Type your answer… Be specific about complexity and when it degrades."
              style={{ flex: 1, minHeight: '120px' }}
            />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={handleSubmit}
                disabled={!answer.trim()}
                className="btn btn-primary"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                <Send size={13} />
                Submit answer
              </button>
              <button onClick={handleReset} className="btn btn-ghost btn-sm">
                Reset
              </button>
            </div>
          </div>
        )}

        {/* Processing */}
        {phase === 'submitted' && (
          <div style={{ textAlign: 'center', padding: '1.5rem 0', flex: 1 }}>
            <div className="animate-pulse" style={{ display: 'inline-block', width: '32px', height: '32px', background: 'var(--color-lime)', borderRadius: '50%', marginBottom: '0.75rem' }} />
            <p className="mono-label text-muted" style={{ letterSpacing: '0.08em' }}>EVALUATING RESPONSE…</p>
          </div>
        )}

        {/* Evaluated */}
        {phase === 'evaluated' && evaluation && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', flex: 1 }} className="animate-fade-in">
            {/* Score bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '2rem',
                  lineHeight: 1,
                  color: evaluation.score >= 70 ? 'var(--color-forest)' : evaluation.score >= 50 ? '#8B6914' : 'var(--color-error)',
                }}
              >
                {evaluation.score}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span className="mono-label text-muted">SCORE</span>
                  <span className="mono-label text-muted">/ 100</span>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${evaluation.score}%`,
                      background: evaluation.score >= 70 ? 'var(--color-forest)' : evaluation.score >= 50 ? '#C49A20' : 'var(--color-error)',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Strengths */}
            {evaluation.strengths.length > 0 && (
              <div>
                <p className="mono-label" style={{ color: 'var(--color-success)', marginBottom: '0.375rem' }}>✓ WHAT WORKED</p>
                {evaluation.strengths.map((s, i) => (
                  <p key={i} style={{ fontSize: '0.8125rem', color: 'var(--color-ink)', lineHeight: 1.5, marginTop: '0.25rem' }}>
                    {s}
                  </p>
                ))}
              </div>
            )}

            {/* Gaps */}
            {evaluation.gaps.length > 0 && (
              <div>
                <p className="mono-label" style={{ color: 'var(--color-error)', marginBottom: '0.375rem' }}>↑ TO IMPROVE</p>
                {evaluation.gaps.map((g, i) => (
                  <p key={i} style={{ fontSize: '0.8125rem', color: 'var(--color-ink)', lineHeight: 1.5, marginTop: '0.25rem' }}>
                    {g}
                  </p>
                ))}
              </div>
            )}

            {/* Ideal answer */}
            <div style={{ background: 'var(--color-paper)', borderRadius: '6px', padding: '0.875rem', border: '1px solid var(--color-border)', borderTop: '2px solid var(--color-lime)' }}>
              <p className="mono-label text-muted" style={{ marginBottom: '0.375rem' }}>STRONGER ANSWER</p>
              <p style={{ fontSize: '0.8125rem', lineHeight: 1.6, color: 'var(--color-ink)', margin: 0 }}>
                {evaluation.ideal}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
              <Link to="/interview/new" className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                Start real interview
                <ChevronRight size={13} />
              </Link>
              <button onClick={handleReset} className="btn btn-outline btn-sm">
                Try again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Main Landing Page ──────────────────────────────────────────────────── */
export const LandingPage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState('swe');

  return (
    <div style={{ background: 'var(--color-paper)', minHeight: '100vh' }}>

      {/* ═══ HERO SECTION ══════════════════════════════════════════════════ */}
      <section style={{ paddingTop: 'var(--space-16)', paddingBottom: 'var(--space-16)' }}>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 'var(--space-12)',
              alignItems: 'start',
            }}
            className="hero-grid"
          >
            {/* ── LEFT COLUMN ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
              {/* Eyebrow */}
              <div className="animate-fade-up">
                <span className="eyebrow">The Interview Practice Room</span>
              </div>

              {/* Headline */}
              <div className="animate-fade-up delay-100">
                <h1
                  style={{
                    margin: 0,
                    fontSize: 'clamp(2.25rem, 4vw, 3.25rem)',
                    lineHeight: 1.08,
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 700,
                    letterSpacing: '-0.03em',
                    color: 'var(--color-ink)',
                  }}
                >
                  Your next interview{' '}
                  <br />
                  <em
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontStyle: 'italic',
                      fontWeight: 400,
                      color: 'var(--color-forest)',
                    }}
                  >
                    isn't the first one.
                  </em>
                </h1>
              </div>

              {/* Subtext */}
              <p
                className="animate-fade-up delay-200"
                style={{
                  margin: 0,
                  fontSize: '1.0625rem',
                  lineHeight: 1.7,
                  color: 'var(--color-muted)',
                  maxWidth: '440px',
                }}
              >
                Resume-aware AI mock interviews for campus placements. 
                Practice with questions built from your actual projects and skills.
                Get feedback that tells you what to fix.
              </p>

              {/* CTAs */}
              <div className="animate-fade-up delay-300" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                <Link to="/interview/new" className="btn btn-primary btn-lg">
                  Start a mock interview
                  <ArrowRight size={16} />
                </Link>
                <a
                  href="#how-it-works"
                  style={{
                    fontSize: '0.9375rem',
                    fontWeight: 500,
                    color: 'var(--color-muted)',
                    textDecoration: 'underline',
                    textUnderlineOffset: '3px',
                    textDecorationColor: 'var(--color-border)',
                    transition: 'color var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-ink)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-muted)'; }}
                >
                  See how it works
                </a>
              </div>

              {/* Trust signals */}
              <div
                className="animate-fade-up delay-400"
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  paddingTop: 'var(--space-2)',
                }}
              >
                {[
                  { icon: <FileText size={12} />, text: 'Resume-aware questions' },
                  { icon: <Target size={12} />, text: 'Role-specific rounds' },
                  { icon: <CheckCircle size={12} />, text: 'Actionable feedback' },
                ].map((item) => (
                  <div
                    key={item.text}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      fontSize: '0.8125rem',
                      color: 'var(--color-muted)',
                    }}
                  >
                    <span style={{ color: 'var(--color-forest)' }}>{item.icon}</span>
                    {item.text}
                  </div>
                ))}
              </div>
            </div>

            {/* ── RIGHT COLUMN: Interactive Preview ── */}
            <div
              className="animate-fade-in delay-200"
              style={{ height: 'min(560px, 90vw)' }}
            >
              <InterviewPreview />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ PROOF STRIP ═══════════════════════════════════════════════════ */}
      <div style={{ borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', background: 'var(--color-white)' }}>
        <div className="container">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-10)',
              padding: 'var(--space-5) 0',
              flexWrap: 'wrap',
            }}
          >
            {[
              { label: 'Role presets', value: '6' },
              { label: 'Interview types', value: '4' },
              { label: 'Max questions', value: '10' },
              { label: 'Evaluated dimensions', value: '5' },
            ].map((item) => (
              <div key={item.label} style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.875rem',
                    lineHeight: 1,
                    color: 'var(--color-ink)',
                  }}
                >
                  {item.value}
                </div>
                <div className="mono-label text-muted" style={{ marginTop: '4px' }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ HOW RESUME-AWARE INTERVIEWS WORK ═════════════════════════════ */}
      <section id="how-it-works" style={{ paddingTop: 'var(--space-20)', paddingBottom: 'var(--space-20)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 'var(--space-12)', alignItems: 'center' }} className="feature-grid">
            {/* Text */}
            <div>
              <span className="eyebrow" style={{ display: 'block', marginBottom: 'var(--space-4)' }}>How it works</span>
              <h2
                style={{
                  margin: '0 0 var(--space-4)',
                  fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
                  fontFamily: 'var(--font-serif)',
                  fontWeight: 400,
                  lineHeight: 1.2,
                  color: 'var(--color-ink)',
                }}
              >
                Questions built from your actual work
              </h2>
              <p style={{ fontSize: '1rem', lineHeight: 1.7, color: 'var(--color-muted)', margin: '0 0 var(--space-6)' }}>
                Upload your PDF or DOCX resume. The parser extracts your projects, 
                tech stack, certifications, and experience. Every interview question 
                is then anchored to what you have actually built — not generic textbook problems.
              </p>
              <Link to="/resumes" className="btn btn-outline" style={{ alignSelf: 'flex-start' }}>
                Upload your resume
                <ChevronRight size={14} />
              </Link>
            </div>

            {/* Visual — Resume → Questions flow */}
            <div
              style={{
                background: 'var(--color-white)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                padding: 'var(--space-6)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-4)',
              }}
            >
              {/* Resume excerpt */}
              <div style={{ padding: '0.875rem 1rem', background: 'var(--color-paper)', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
                <p className="mono-label text-muted" style={{ marginBottom: '0.5rem' }}>RESUME EXTRACT</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                  {['Python', 'FastAPI', 'PostgreSQL', 'Redis', 'Docker', 'React', 'REST APIs'].map((skill) => (
                    <span key={skill} className="badge badge-muted">{skill}</span>
                  ))}
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', marginTop: '0.625rem', marginBottom: 0 }}>
                  Project: <strong style={{ color: 'var(--color-ink)' }}>E-commerce API with Redis caching &amp; background jobs</strong>
                </p>
              </div>

              {/* Arrow */}
              <div style={{ textAlign: 'center', color: 'var(--color-lime)', fontSize: '1.25rem' }}>↓</div>

              {/* Generated questions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                <p className="mono-label text-muted">AI-GENERATED QUESTIONS</p>
                {[
                  { n: '01', q: 'How did you implement cache invalidation in your Redis layer?' },
                  { n: '02', q: 'What consistency model did you choose for your PostgreSQL + Redis setup, and why?' },
                  { n: '03', q: 'Walk me through how you handled failed background jobs in production.' },
                ].map((item) => (
                  <div
                    key={item.n}
                    style={{
                      display: 'flex',
                      gap: '0.75rem',
                      padding: '0.75rem 0.875rem',
                      background: 'var(--color-paper)',
                      borderRadius: '6px',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    <span className="mono-label" style={{ color: 'var(--color-forest)', flexShrink: 0 }}>Q{item.n}</span>
                    <p style={{ fontSize: '0.8125rem', lineHeight: 1.5, color: 'var(--color-ink)', margin: 0 }}>{item.q}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ WHAT THE FEEDBACK LOOKS LIKE ════════════════════════════════ */}
      <section style={{ background: 'var(--color-white)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', padding: 'var(--space-20) 0' }}>
        <div className="container">
          <div style={{ maxWidth: '640px', marginBottom: 'var(--space-12)' }}>
            <span className="eyebrow" style={{ display: 'block', marginBottom: 'var(--space-3)' }}>Evaluation</span>
            <h2
              style={{
                margin: 0,
                fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
                fontFamily: 'var(--font-serif)',
                fontWeight: 400,
                lineHeight: 1.2,
              }}
            >
              Feedback that tells you what to fix
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-5)' }}>
            {[
              {
                dimension: 'Technical Correctness',
                weight: '35%',
                score: 72,
                desc: 'Accuracy of concepts, algorithms, and data structures cited in your answer.',
              },
              {
                dimension: 'Reasoning Depth',
                weight: '20%',
                score: 58,
                desc: 'How well you explain trade-offs, edge cases, and your reasoning process.',
              },
              {
                dimension: 'Communication Clarity',
                weight: '15%',
                score: 85,
                desc: 'Structure, coherence, and how easy it is to follow your explanation.',
              },
              {
                dimension: 'Answer Relevance',
                weight: '20%',
                score: 80,
                desc: 'Whether your response directly addresses what was asked.',
              },
            ].map((dim) => (
              <div
                key={dim.dimension}
                style={{
                  padding: 'var(--space-5)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-3)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--color-ink)' }}>{dim.dimension}</span>
                  <span className="mono-label text-muted">{dim.weight}</span>
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', margin: 0, lineHeight: 1.5 }}>{dim.desc}</p>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span className="mono-label text-muted">EXAMPLE</span>
                    <span
                      className="mono-label"
                      style={{ color: dim.score >= 75 ? 'var(--color-success)' : dim.score >= 60 ? '#8B6914' : 'var(--color-error)' }}
                    >
                      {dim.score}/100
                    </span>
                  </div>
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${dim.score}%`,
                        background: dim.score >= 75 ? 'var(--color-forest)' : dim.score >= 60 ? '#C49A20' : 'var(--color-error)',
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: 'var(--space-8)',
              padding: 'var(--space-5)',
              background: 'var(--color-paper)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              borderLeft: '3px solid var(--color-lime)',
            }}
          >
            <p className="mono-label text-muted" style={{ marginBottom: '0.5rem' }}>EXAMPLE: STRONGER ANSWER EXAMPLE</p>
            <p style={{ fontSize: '0.9375rem', lineHeight: 1.65, color: 'var(--color-ink)', margin: 0 }}>
              "A Python dict uses a hash table for O(1) average-case lookups. Collisions are handled via open addressing. 
              In the worst case — when many keys hash to the same slot — lookup degrades to O(n). 
              Python mitigates this with randomized hash seeds (PEP 456) and a compact table layout introduced in 3.6."
            </p>
          </div>
        </div>
      </section>

      {/* ═══ ROLE PRESETS / CHOOSE YOUR PATH ════════════════════════════ */}
      <section style={{ padding: 'var(--space-20) 0' }}>
        <div className="container">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-10)', textAlign: 'center' }}>
            <span className="eyebrow">Practice paths</span>
            <h2
              style={{
                margin: 0,
                fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
                fontFamily: 'var(--font-serif)',
                fontWeight: 400,
                lineHeight: 1.2,
              }}
            >
              Choose your role, start practising
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'var(--space-3)',
              marginBottom: 'var(--space-8)',
            }}
          >
            {ROLE_PRESETS.map((role) => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`option-card${selectedRole === role.id ? ' selected' : ''}`}
                style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textAlign: 'left', width: '100%', background: 'var(--color-white)' }}
              >
                <span style={{ color: selectedRole === role.id ? 'var(--color-forest)' : 'var(--color-muted)' }}>{role.icon}</span>
                <span style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--color-ink)' }}>{role.label}</span>
              </button>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <Link to="/interview/new" className="btn btn-primary btn-xl">
              Start practising now
              <ArrowRight size={17} />
            </Link>
            <p style={{ marginTop: 'var(--space-3)', fontSize: '0.8125rem', color: 'var(--color-muted)' }}>
              No account required for your first demo. Sign in to save progress.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ WORKFLOW ════════════════════════════════════════════════════ */}
      <section style={{ background: 'var(--color-contrast-section)', padding: 'var(--space-20) 0' }}>
        <div className="container">
          <div style={{ marginBottom: 'var(--space-12)', maxWidth: '500px' }}>
            <span className="eyebrow" style={{ color: 'var(--color-lime)', display: 'block', marginBottom: 'var(--space-3)' }}>
              The process
            </span>
            <h2
              style={{
                margin: 0,
                fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
                fontFamily: 'var(--font-serif)',
                fontWeight: 400,
                lineHeight: 1.2,
                color: 'var(--color-white)',
              }}
            >
              From resume to report in four steps
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-1)' }}>
            {[
              {
                step: '01',
                title: 'Upload resume',
                desc: 'PDF or DOCX. The parser extracts your projects, skills, and experience.',
              },
              {
                step: '02',
                title: 'Configure interview',
                desc: 'Choose role, company, difficulty, type (Technical / HR / Behavioral), and duration.',
              },
              {
                step: '03',
                title: 'Answer questions',
                desc: 'One question at a time. Type your answers. Session recovers if you refresh.',
              },
              {
                step: '04',
                title: 'Get your report',
                desc: 'Score breakdown, stronger-answer examples, and a 7-day personalised practice plan.',
              },
            ].map((item, idx) => (
              <div
                key={item.step}
                style={{
                  padding: 'var(--space-6)',
                  borderLeft: `1px solid rgba(217,217,209,0.15)`,
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    color: 'var(--color-lime)',
                    marginBottom: 'var(--space-4)',
                  }}
                >
                  {item.step}
                </div>
                <h3
                  style={{
                    margin: '0 0 var(--space-3)',
                    fontSize: '1.0625rem',
                    fontWeight: 600,
                    color: 'var(--color-white)',
                  }}
                >
                  {item.title}
                </h3>
                <p style={{ fontSize: '0.875rem', lineHeight: 1.65, color: 'rgba(255,255,255,0.55)', margin: 0 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══════════════════════════════════════════════════ */}
      <section style={{ padding: 'var(--space-24) 0', borderTop: '1px solid var(--color-border)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <span className="eyebrow" style={{ display: 'block', marginBottom: 'var(--space-4)' }}>Get started today</span>
          <h2
            style={{
              margin: '0 auto var(--space-6)',
              maxWidth: '540px',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontFamily: 'var(--font-serif)',
              fontWeight: 400,
              lineHeight: 1.15,
              color: 'var(--color-ink)',
            }}
          >
            Practice before the pressure.
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--color-muted)', marginBottom: 'var(--space-8)', maxWidth: '440px', margin: '0 auto var(--space-8)' }}>
            The interview room is open. Answer the first question in the next 30 seconds.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <Link to="/interview/new" className="btn btn-primary btn-xl">
              Start a mock interview
              <ArrowRight size={17} />
            </Link>
            <Link to="/register" className="btn btn-outline btn-xl">
              Create account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

/* ─── Responsive CSS injected via <style> ──────────────────────────────── */
const landingStyles = `
  @media (max-width: 900px) {
    .hero-grid {
      grid-template-columns: 1fr !important;
    }
    .feature-grid {
      grid-template-columns: 1fr !important;
    }
  }

  @media (max-width: 640px) {
    .hero-grid > div:last-child {
      height: 460px !important;
    }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const existing = document.getElementById('landing-styles');
  if (!existing) {
    const style = document.createElement('style');
    style.id = 'landing-styles';
    style.textContent = landingStyles;
    document.head.appendChild(style);
  }
}
