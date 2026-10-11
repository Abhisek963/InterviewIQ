import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { InterviewReport, InterviewSession } from '../../types';
import {
  Trophy, Award, CheckCircle2, AlertCircle, ArrowLeft, Calendar,
  BookOpen, Sparkles, RefreshCw, BarChart3, HelpCircle, ArrowUpRight,
  TrendingUp, Clock
} from 'lucide-react';

export const ReportPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [report, setReport] = useState<InterviewReport | null>(null);
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeDay, setActiveDay] = useState(1);

  useEffect(() => {
    if (sessionId) {
      loadReport(sessionId);
    }
  }, [sessionId]);

  async function loadReport(sid: string) {
    setLoading(true);
    setError('');
    try {
      const [rep, sess] = await Promise.all([
        api.getSessionReport(sid),
        api.getInterviewSession(sid)
      ]);
      setReport(rep);
      setSession(sess);
    } catch (err: any) {
      setError(err.message || 'Failed to load evaluation report');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{ background: 'var(--color-paper)', minHeight: 'calc(100vh - 3.5rem)' }} className="flex flex-col items-center justify-center p-8">
        <div className="w-10 h-10 border-2 border-[var(--color-forest)] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-serif text-xl text-[var(--color-ink)]">Synthesizing Comprehensive Evaluation...</p>
        <p className="text-xs font-mono uppercase tracking-wider text-[var(--color-muted)] mt-1">Calibrating rubric scores & 7-day placement curriculum</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div style={{ background: 'var(--color-paper)', minHeight: 'calc(100vh - 3.5rem)' }} className="flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-white border border-[var(--color-border)] p-8 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-rose-600 mx-auto opacity-70" />
          <h2 className="font-serif text-2xl text-[var(--color-ink)]">Report Not Available</h2>
          <p className="text-xs text-[var(--color-muted)] font-mono">{error || 'Could not retrieve evaluation dossier for this session.'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-mono font-bold uppercase tracking-wider bg-[var(--color-ink)] text-[var(--color-paper)] hover:bg-[var(--color-forest)] transition-all"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const overall = report.overall_score || 0;
  const dims = report.dimension_scores || {
    technical_correctness: 0,
    relevance: 0,
    reasoning_and_depth: 0,
    communication_clarity: 0,
    answer_structure: 0
  };

  const dimensionList = [
    { label: 'Technical Accuracy & Correctness', weight: '35%', value: dims.technical_correctness },
    { label: 'Relevance to Question Intent', weight: '20%', value: dims.relevance },
    { label: 'Reasoning, Depth & Architecture', weight: '20%', value: dims.reasoning_and_depth },
    { label: 'Communication Clarity & Conciseness', weight: '15%', value: dims.communication_clarity },
    { label: 'Structure (STAR / Top-Down)', weight: '10%', value: dims.answer_structure },
  ];

  return (
    <div style={{ background: 'var(--color-paper)', minHeight: 'calc(100vh - 3.5rem)' }} className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[var(--color-border)]">
          <div>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[var(--color-muted)] hover:text-[var(--color-ink)] uppercase tracking-wider mb-3 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Command Dashboard</span>
            </Link>
            
            <div className="flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-[var(--color-muted)] mb-1">
              <span className="w-2 h-2 rounded-full bg-[var(--color-forest)] inline-block"></span>
              <span>[ EVALUATION DOSSIER // DEEP DIAGNOSTIC ]</span>
            </div>
            
            <h1 className="font-serif text-3xl sm:text-4xl text-[var(--color-ink)] tracking-tight">
              Placement Performance Report Card
            </h1>
            <p className="text-sm text-[var(--color-muted)] mt-1 font-mono">
              Target: <span className="font-bold text-[var(--color-ink)]">{session?.company_name}</span> • Role: <span className="text-[var(--color-ink)]">{session?.job_title}</span> • Track: <span className="capitalize">{session?.interview_type}</span>
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/interview/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider bg-[var(--color-ink)] text-[var(--color-paper)] hover:bg-[var(--color-forest)] transition-all shadow-sm font-mono"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch Next Drill</span>
            </Link>
          </div>
        </div>

        {/* Master Score Board Card */}
        <div
          style={{
            background: 'var(--color-card-hero)',
            borderColor: 'var(--color-card-hero-border)',
            color: '#FFFFFF'
          }}
          className="p-6 sm:p-10 border shadow-md relative overflow-hidden"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            
            <div className="md:col-span-2 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-xs font-mono uppercase tracking-wider">
                <Award className="w-3.5 h-3.5 text-[var(--color-lime)]" />
                <span>Verified AI Placement Assessment</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl text-white">
                Performance Evaluation Synthesis
              </h2>
              <p className="text-xs sm:text-sm text-stone-200 leading-relaxed font-sans max-w-2xl">
                {report.summary || `Candidate attained an aggregate benchmark score of ${overall}/100 across evaluated competencies.`}
              </p>
            </div>

            <div className="bg-black/25 border border-white/15 p-6 text-center space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-stone-300 block">
                AGGREGATE BENCHMARK
              </span>
              <div className="flex items-baseline justify-center gap-1">
                <span className="font-serif text-5xl sm:text-6xl font-bold text-white tracking-tight">{overall}</span>
                <span className="font-mono text-sm text-[var(--color-lime)]">/100</span>
              </div>
              <div className="pt-2">
                <span className={`inline-block px-3 py-1 text-[11px] font-mono uppercase tracking-wider font-bold ${
                  overall >= 80
                    ? 'bg-[var(--color-lime)] text-[var(--color-ink)]'
                    : overall >= 60
                    ? 'bg-amber-400 text-stone-900'
                    : 'bg-rose-400 text-stone-900'
                }`}>
                  {overall >= 80 ? 'Placement Ready' : overall >= 60 ? 'Competitive Standing' : 'Foundational Practice Required'}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Two-Column: Dimension Breakdown & Diagnostic Takeaways */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Dimension Scores */}
          <div className="bg-white border border-[var(--color-border)] p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="pb-3 border-b border-[var(--color-border)] flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-[var(--color-ink)] flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[var(--color-forest)]" />
                <span>Dimension Score Breakdown</span>
              </h3>
              <span className="text-[10px] font-mono text-[var(--color-muted)] uppercase tracking-wider">
                Weighted Rubric
              </span>
            </div>

            <div className="space-y-4 pt-1">
              {dimensionList.map((dim, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-sans font-medium text-[var(--color-ink)]">
                      {dim.label} <span className="text-[var(--color-muted)] font-mono text-[10px]">({dim.weight})</span>
                    </span>
                    <span className="font-mono font-bold text-[var(--color-ink)]">{dim.value}/100</span>
                  </div>
                  <div className="w-full h-2 bg-[var(--color-paper-dark)] border border-[var(--color-border)] overflow-hidden">
                    <div
                      className="h-full bg-[var(--color-forest)] transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(0, dim.value))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Diagnostic Takeaways */}
          <div className="bg-white border border-[var(--color-border)] p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="pb-3 border-b border-[var(--color-border)] flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-[var(--color-ink)] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[var(--color-forest)]" />
                <span>Placement Diagnostics</span>
              </h3>
              <span className="text-[10px] font-mono text-[var(--color-muted)] uppercase tracking-wider">
                AI Feedback
              </span>
            </div>

            {/* Strengths */}
            <div className="space-y-2">
              <h4 className="text-xs font-mono font-bold text-[var(--color-forest)] uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Demonstrated Competencies ({report.strengths.length})</span>
              </h4>
              <ul className="space-y-2">
                {report.strengths.map((str, i) => (
                  <li key={i} className="text-xs text-[var(--color-ink)] flex items-start gap-2 bg-[var(--color-paper)] p-3 border border-[var(--color-border)]">
                    <span className="text-[var(--color-forest)] font-mono font-bold">✓</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Improvements */}
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-mono font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>Priority Improvement Opportunities ({report.improvements.length})</span>
              </h4>
              <ul className="space-y-2">
                {report.improvements.map((imp, i) => (
                  <li key={i} className="text-xs text-[var(--color-ink)] flex items-start gap-2 bg-amber-50/60 p-3 border border-amber-200">
                    <span className="text-amber-700 font-mono font-bold">!</span>
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>

        {/* Question-by-Question Detailed Review Ledger */}
        <div className="bg-white border border-[var(--color-border)] p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="pb-3 border-b border-[var(--color-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-serif text-xl font-bold text-[var(--color-ink)] flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[var(--color-forest)]" />
                <span>Question-by-Question Evaluator Ledger</span>
              </h3>
              <p className="text-xs text-[var(--color-muted)] font-mono mt-0.5">
                Audit your verbatim transcripts alongside the calibrated model answers.
              </p>
            </div>
            <span className="text-xs font-mono text-[var(--color-muted)]">
              {report.answer_reviews.length} Items Evaluated
            </span>
          </div>

          {report.answer_reviews.length === 0 ? (
            <p className="text-xs text-[var(--color-muted)] font-mono p-8 text-center">No individual question reviews available.</p>
          ) : (
            <div className="space-y-6">
              {report.answer_reviews.map((item, idx) => (
                <div key={idx} className="p-5 sm:p-6 bg-[var(--color-paper)] border border-[var(--color-border)] space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--color-forest)]">
                      Question [{String(item.sequence_number).padStart(2, '0')}]
                    </span>
                    <span className={`px-2.5 py-0.5 text-xs font-mono font-bold uppercase tracking-wider border ${
                      item.score >= 80
                        ? 'bg-[var(--color-forest-light)] text-[var(--color-forest)] border-[var(--color-forest)]/40'
                        : item.score >= 60
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'bg-rose-100 text-rose-900 border-rose-300'
                    }`}>
                      Score: {item.score}/100
                    </span>
                  </div>

                  <h4 className="font-serif text-base sm:text-lg text-[var(--color-ink)] font-bold">
                    {item.question_text}
                  </h4>

                  {/* Submitted Answer */}
                  <div className="p-4 bg-white border border-[var(--color-border)] space-y-1">
                    <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--color-muted)]">
                      Your Submitted Transcript:
                    </p>
                    <p className="text-xs text-[var(--color-ink)] leading-relaxed whitespace-pre-wrap font-sans">
                      {item.user_answer}
                    </p>
                  </div>

                  {/* Evaluator Feedback */}
                  <div className="p-4 bg-[var(--color-forest-light)] border border-[var(--color-forest)]/20 text-xs text-[var(--color-ink)] space-y-1">
                    <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--color-forest)]">
                      AI Evaluator Assessment:
                    </p>
                    <p className="leading-relaxed font-sans">{item.feedback_summary}</p>
                  </div>

                  {/* Stronger Answer */}
                  {item.example_stronger_answer && (
                    <div className="p-4 bg-amber-50 border border-amber-200 text-xs space-y-1">
                      <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                        <span>💡 High-Scoring Benchmark Answer:</span>
                      </p>
                      <p className="text-stone-800 leading-relaxed font-sans">{item.example_stronger_answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 7-Day Personalized Practice Plan */}
        <div className="bg-white border border-[var(--color-border)] p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="pb-3 border-b border-[var(--color-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-[var(--color-muted)] mb-1">
                <span className="w-2 h-2 rounded-full bg-[var(--color-forest)] inline-block"></span>
                <span>[ PLACEMENT ROADMAP // 7-DAY ACCELERATOR ]</span>
              </div>
              <h3 className="font-serif text-xl font-bold text-[var(--color-ink)] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[var(--color-forest)]" />
                <span>Targeted Placement Curriculum</span>
              </h3>
              <p className="text-xs text-[var(--color-muted)] font-mono mt-0.5">
                Formulated from evaluated deficits in {session?.company_name || 'your target'} interviews.
              </p>
            </div>
          </div>

          {/* Day Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {report.practice_plan.map((plan) => {
              const isActive = activeDay === plan.day;
              return (
                <button
                  key={plan.day}
                  onClick={() => setActiveDay(plan.day)}
                  className={`px-4 py-2 text-xs font-mono uppercase tracking-wider font-bold shrink-0 transition-all border ${
                    isActive
                      ? 'bg-[var(--color-forest)] text-white border-[var(--color-forest)] shadow-xs'
                      : 'bg-[var(--color-paper)] text-[var(--color-muted)] border-[var(--color-border)] hover:bg-[var(--color-paper-dark)]'
                  }`}
                >
                  Day {plan.day}
                </button>
              );
            })}
          </div>

          {/* Active Day Content */}
          {report.practice_plan.find(p => p.day === activeDay) && (
            <div className="p-6 bg-[var(--color-paper)] border border-[var(--color-border)] space-y-6">
              <div className="pb-3 border-b border-[var(--color-border)]">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-muted)] block mb-1">
                  Day 0{activeDay} Daily Target
                </span>
                <h4 className="font-serif text-lg font-bold text-[var(--color-ink)]">
                  {report.practice_plan.find(p => p.day === activeDay)?.focus_area}
                </h4>
              </div>

              {/* Tasks */}
              <div>
                <p className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--color-muted)] mb-3">
                  Prescribed Placement Drills:
                </p>
                <div className="space-y-2">
                  {report.practice_plan.find(p => p.day === activeDay)?.tasks.map((task, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-[var(--color-ink)] bg-white p-3 border border-[var(--color-border)] font-sans">
                      <span className="font-mono text-[var(--color-forest)] font-bold">0{i + 1}.</span>
                      <span>{task}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Learning Resources */}
              <div>
                <p className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--color-muted)] mb-3 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[var(--color-forest)]" />
                  <span>Curated Reference Resources:</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {report.practice_plan.find(p => p.day === activeDay)?.resource_recommendations.map((res, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-white text-[var(--color-ink)] text-xs font-mono border border-[var(--color-border)]"
                    >
                      {res}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
};
