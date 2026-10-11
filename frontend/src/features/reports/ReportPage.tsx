import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { InterviewReport, InterviewSession } from '../../types';
import { Card, Badge, ProgressBar } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Trophy, Award, CheckCircle2, AlertCircle, ArrowLeft, Calendar, BookOpen, Sparkles, RefreshCw, BarChart3, HelpCircle } from 'lucide-react';

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
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold animate-spin mb-3">
          <RefreshCw className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-slate-700">Generating Comprehensive AI Report...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-900">Report Not Found</h2>
        <p className="text-sm text-slate-500">{error || 'Could not retrieve report data.'}</p>
        <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button & header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 mb-2">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Interview Performance Report Card
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {session?.company_name} • {session?.job_title} ({session?.interview_type} round)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/interview/new">
            <Button size="sm" className="gap-2">
              <Sparkles className="w-4 h-4" />
              <span>Try Another Interview</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Score Banner Hero */}
      <Card className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div className="md:col-span-2 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-indigo-200">
              <Award className="w-4 h-4 text-indigo-400" />
              <span>Verified AI Evaluation Result</span>
            </div>
            <h2 className="text-xl font-bold">Overall Performance Summary</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              {report.summary || `Candidate achieved an overall performance score of ${overall}/100.`}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center border border-white/15">
            <p className="text-xs text-indigo-200 font-semibold uppercase tracking-wider mb-1">Overall Score</p>
            <p className="text-5xl font-extrabold text-white">{overall}<span className="text-2xl text-indigo-300">/100</span></p>
            <div className="mt-3 inline-block">
              <Badge variant={overall >= 80 ? 'green' : overall >= 60 ? 'yellow' : 'red'}>
                {overall >= 80 ? 'Placement Ready' : overall >= 60 ? 'Needs Refinement' : 'Foundational Practice'}
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Dimension Scores & Key Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Dimension Scores Breakdown */}
        <Card className="space-y-4">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 border-b border-slate-100 pb-3">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            <span>Dimension Score Breakdown</span>
          </h3>

          <div className="space-y-4 pt-1">
            <ProgressBar label="Technical Correctness (35%)" value={dims.technical_correctness} color="bg-indigo-600" />
            <ProgressBar label="Relevance to Question (20%)" value={dims.relevance} color="bg-emerald-600" />
            <ProgressBar label="Reasoning & Technical Depth (20%)" value={dims.reasoning_and_depth} color="bg-violet-600" />
            <ProgressBar label="Communication Clarity (15%)" value={dims.communication_clarity} color="bg-amber-600" />
            <ProgressBar label="Answer Structure (10%)" value={dims.answer_structure} color="bg-slate-700" />
          </div>
        </Card>

        {/* Strengths & Improvements */}
        <Card className="space-y-5">
          <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">
            Key Diagnostic Takeaways
          </h3>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Demonstrated Strengths</span>
            </h4>
            <ul className="space-y-1.5 pl-6 text-xs text-slate-700 list-disc">
              {report.strengths.map((str, i) => (
                <li key={i}>{str}</li>
              ))}
            </ul>
          </div>

          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>Priority Improvement Areas</span>
            </h4>
            <ul className="space-y-1.5 pl-6 text-xs text-slate-700 list-disc">
              {report.improvements.map((imp, i) => (
                <li key={i}>{imp}</li>
              ))}
            </ul>
          </div>
        </Card>
      </div>

      {/* Question-by-Question Review */}
      <Card className="space-y-6">
        <h3 className="font-bold text-slate-900 text-lg border-b border-slate-100 pb-3 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-indigo-600" />
          <span>Question-by-Question Review</span>
        </h3>

        {report.answer_reviews.length === 0 ? (
          <p className="text-xs text-slate-400">No question reviews recorded.</p>
        ) : (
          <div className="space-y-6">
            {report.answer_reviews.map((item, idx) => (
              <div key={idx} className="p-5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-600">Question #{item.sequence_number}</span>
                  <Badge variant={item.score >= 80 ? 'green' : item.score >= 60 ? 'yellow' : 'red'}>
                    Score: {item.score}/100
                  </Badge>
                </div>

                <h4 className="font-bold text-slate-900 text-sm">{item.question_text}</h4>

                <div className="p-3 bg-white border border-slate-200 rounded-lg">
                  <p className="text-xs font-semibold text-slate-500 mb-1">Your Submitted Answer:</p>
                  <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">{item.user_answer}</p>
                </div>

                <div className="text-xs text-slate-600 bg-indigo-50/50 p-3 rounded-lg border border-indigo-100">
                  <span className="font-bold text-indigo-900">Evaluator Feedback: </span>
                  {item.feedback_summary}
                </div>

                {item.example_stronger_answer && (
                  <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg text-xs">
                    <span className="font-bold text-amber-900 block mb-1">💡 Example of a Stronger Answer:</span>
                    <p className="text-amber-950/90 leading-relaxed">{item.example_stronger_answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 7-Day Practice Plan */}
      <Card className="space-y-6 border-indigo-200 bg-gradient-to-b from-white to-indigo-50/30">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <span>Personalized 7-Day Placement Practice Plan</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Customized roadmap based on your evaluated weaknesses</p>
          </div>
        </div>

        {/* Day Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {report.practice_plan.map((plan) => (
            <button
              key={plan.day}
              onClick={() => setActiveDay(plan.day)}
              className={`px-4 py-2 rounded-lg text-xs font-bold shrink-0 transition-all ${
                activeDay === plan.day
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              Day {plan.day}
            </button>
          ))}
        </div>

        {/* Active Day Content */}
        {report.practice_plan.find(p => p.day === activeDay) && (
          <div className="p-5 bg-white rounded-xl border border-slate-200 space-y-4">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span>Day {activeDay} Focus Area:</span>
              <span className="text-indigo-600 font-extrabold">{report.practice_plan.find(p => p.day === activeDay)?.focus_area}</span>
            </h4>

            <div>
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Recommended Daily Tasks:</p>
              <ul className="space-y-1.5 pl-6 text-xs text-slate-700 list-disc">
                {report.practice_plan.find(p => p.day === activeDay)?.tasks.map((task, i) => (
                  <li key={i}>{task}</li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                <span>Recommended Learning Resources:</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {report.practice_plan.find(p => p.day === activeDay)?.resource_recommendations.map((res, i) => (
                  <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-mono rounded border border-slate-200">
                    {res}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
