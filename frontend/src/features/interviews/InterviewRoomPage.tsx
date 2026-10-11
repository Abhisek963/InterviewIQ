import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { InterviewSession, InterviewQuestion, AnswerFeedback } from '../../types';
import { Card, Badge, ProgressBar } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Brain, Send, AlertTriangle, CheckCircle2, Award, Clock, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';

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

  useEffect(() => {
    if (sessionId) {
      loadSessionState(sessionId);
    }
  }, [sessionId]);

  async function loadSessionState(sid: string) {
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
  }

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerText.trim() || !sessionId) {
      setError('Please type your response before submitting.');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      const res = await api.submitAnswer(sessionId, answerText.trim());
      setLastFeedback(res.evaluation?.feedback ? {
        score: res.evaluation.score,
        dimension_scores: res.evaluation.dimension_scores,
        ...res.evaluation.feedback
      } : null);

      setAnswerText('');

      if (res.is_final || res.status === 'completed') {
        // Finished last question -> Navigate to final report!
        navigate(`/report/${sessionId}`);
      } else {
        // Fetch next question
        const s = await api.getInterviewSession(sessionId);
        setSession(s);
        const nextQ = await api.getCurrentQuestion(sessionId);
        setCurrentQuestion(nextQ);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit answer');
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
    } catch (err: any) {
      setError('Failed to finish interview session');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold animate-pulse mb-3">
          <Brain className="w-7 h-7" />
        </div>
        <p className="text-sm font-semibold text-slate-700">Loading AI Interview Room...</p>
      </div>
    );
  }

  if (!session || !currentQuestion) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-900">Session Not Found</h2>
        <p className="text-sm text-slate-500">The requested interview session could not be retrieved.</p>
        <Button onClick={() => navigate('/dashboard')}>Return to Dashboard</Button>
      </div>
    );
  }

  const totalQuestions = session.question_plan ? session.question_plan.length : 5;
  const currentSeq = currentQuestion.sequence_number;
  const wordCount = answerText.trim() ? answerText.trim().split(/\s+/).length : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Session Progress Bar & Controls */}
      <Card className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white border-slate-200">
        <div className="space-y-1 flex-1">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>{session.company_name} • {session.job_title}</span>
            <span>Question {currentSeq} of {totalQuestions}</span>
          </div>
          <ProgressBar value={currentSeq} max={totalQuestions} color="bg-indigo-600" />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowExitConfirm(true)}
            className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
          >
            Finish & Evaluate
          </Button>
        </div>
      </Card>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Question Card */}
      <Card className="space-y-6 border-indigo-100/80 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Badge variant="indigo">{currentQuestion.category.toUpperCase()}</Badge>
            <Badge variant="slate">{currentQuestion.topic}</Badge>
            <Badge variant="yellow">{currentQuestion.difficulty}</Badge>
          </div>
          <span className="text-xs font-semibold text-slate-400">Live AI Question</span>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
            {currentQuestion.question_text}
          </h2>
          <p className="text-xs text-slate-500 italic">
            Tip: Be specific, explain trade-offs, and structure your answer clearly.
          </p>
        </div>

        {/* Answer Input Area */}
        <form onSubmit={handleSubmitAnswer} className="space-y-4 pt-2">
          <div>
            <div className="flex justify-between items-center mb-1 text-xs font-semibold text-slate-700">
              <label>Your Response</label>
              <span className={wordCount < 15 ? 'text-amber-600' : 'text-emerald-600'}>
                {wordCount} words {wordCount < 15 && '(Aim for 30+ words for full credit)'}
              </span>
            </div>
            <textarea
              rows={7}
              required
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              placeholder="Type your response here... (e.g. 'In my approach, I would first handle the edge cases by...')"
              className="w-full p-4 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed font-sans"
            />
          </div>

          <div className="flex justify-between items-center pt-2">
            <span className="text-xs text-slate-400">Pressing submit will record and evaluate your response.</span>
            <Button
              type="submit"
              size="lg"
              isLoading={submitting}
              disabled={!answerText.trim()}
              className="px-6 gap-2"
            >
              <span>{currentSeq === totalQuestions ? 'Submit Final Answer' : 'Submit & Next Question'}</span>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </Card>

      {/* Previous Question Feedback Box */}
      {lastFeedback && (
        <Card className="bg-emerald-50/60 border-emerald-200 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-emerald-900 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Previous Answer Feedback Score: {lastFeedback.score}/100</span>
            </h4>
          </div>
          {lastFeedback.strengths && lastFeedback.strengths.length > 0 && (
            <p className="text-xs text-emerald-800">
              <span className="font-semibold">Strength:</span> {lastFeedback.strengths[0]}
            </p>
          )}
          {lastFeedback.improvements && lastFeedback.improvements.length > 0 && (
            <p className="text-xs text-amber-800">
              <span className="font-semibold">Key Growth Area:</span> {lastFeedback.improvements[0]}
            </p>
          )}
        </Card>
      )}

      {/* Exit Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-slate-900 text-lg">Finish Interview Early?</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Finishing early will evaluate all answers submitted so far and generate your final report card and 7-day practice plan.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowExitConfirm(false)}>
                Continue Interview
              </Button>
              <Button variant="danger" size="sm" onClick={handleFinishEarly} isLoading={submitting}>
                Finish & View Report
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
