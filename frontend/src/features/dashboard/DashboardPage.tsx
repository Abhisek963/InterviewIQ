import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { api } from '../../lib/api';
import { InterviewSession, Resume, InterviewReport } from '../../types';
import { Card, Badge, ProgressBar } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Sparkles, FileText, History, Trophy, Clock, CheckCircle2, ArrowRight, Play, Award, BarChart2 } from 'lucide-react';

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
          api.listReports()
        ]);
        setSessions(sList);
        setResumes(rList);
        setReports(repList);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const completedSessions = sessions.filter(s => s.status === 'completed');
  const validScores = reports.map(r => r.overall_score).filter((s): s is number => s !== undefined && s !== null);
  const avgScore = validScores.length > 0 ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-indigo-200 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Campus Placement Readiness Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Welcome back, {user?.full_name || 'Candidate'}!
            </h1>
            <p className="text-indigo-200 text-sm mt-1 max-w-xl">
              {user?.college_name ? `${user.college_name} • ` : ''}
              Prepare for technical rounds, behavioral interviews, and top company placements.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              to="/interview/new"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-white text-indigo-900 font-semibold text-sm rounded-xl hover:bg-indigo-50 shadow-md transition-all"
            >
              <Play className="w-4 h-4 fill-indigo-900" />
              <span>Start New Interview</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Average Performance</p>
            <p className="text-2xl font-extrabold text-slate-900">{avgScore > 0 ? `${avgScore}/100` : 'N/A'}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Completed Sessions</p>
            <p className="text-2xl font-extrabold text-slate-900">{completedSessions.length}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Parsed Resumes</p>
            <p className="text-2xl font-extrabold text-slate-900">{resumes.length}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold">
            <BarChart2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Placement Readiness</p>
            <p className="text-2xl font-extrabold text-slate-900">{avgScore >= 80 ? 'High' : avgScore >= 60 ? 'Moderate' : 'Building'}</p>
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Interviews */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-600" />
              <span>Recent Interview Sessions</span>
            </h2>
            <Link to="/history" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <Card className="p-8 text-center text-slate-400">Loading sessions...</Card>
          ) : sessions.length === 0 ? (
            <Card className="p-10 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800">No Interview Sessions Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Upload your resume, configure your target company and role, and complete your first AI mock interview.
              </p>
              <div className="pt-2">
                <Link to="/resumes">
                  <Button size="sm">Upload Resume & Get Started</Button>
                </Link>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {sessions.slice(0, 5).map(session => {
                const report = reports.find(r => r.session_id === session.id);
                return (
                  <Card key={session.id} className="flex items-center justify-between p-5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{session.company_name}</span>
                        <span className="text-slate-400 text-xs">•</span>
                        <span className="text-xs font-medium text-slate-600">{session.job_title}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Badge variant={session.status === 'completed' ? 'green' : session.status === 'in_progress' ? 'indigo' : 'slate'}>
                          {session.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <span>{session.interview_type} round</span>
                        <span>•</span>
                        <span>{session.duration_minutes} mins</span>
                      </div>
                    </div>

                    <div>
                      {session.status === 'completed' && report ? (
                        <Link to={`/report/${session.id}`}>
                          <Button size="sm" variant="outline" className="gap-1.5">
                            <Award className="w-4 h-4 text-indigo-600" />
                            <span>Score: {report.overall_score || 0}/100</span>
                          </Button>
                        </Link>
                      ) : (
                        <Link to={`/interview/room/${session.id}`}>
                          <Button size="sm" className="gap-1.5">
                            <Play className="w-3.5 h-3.5" />
                            <span>{session.status === 'in_progress' ? 'Resume' : 'Start'}</span>
                          </Button>
                        </Link>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar Status */}
        <div className="space-y-6">
          <Card className="space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>Resume Status</span>
            </h3>

            {resumes.length === 0 ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-2">
                <p className="font-semibold">No Resume Uploaded</p>
                <p className="text-amber-700">Upload a PDF or DOCX resume so the AI can craft questions targeting your actual projects.</p>
                <Link to="/resumes" className="inline-block pt-1 font-bold text-indigo-700 hover:underline">
                  Upload Resume →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {resumes.slice(0, 2).map(r => (
                  <div key={r.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                    <div className="truncate max-w-[180px]">
                      <p className="font-semibold text-slate-800 truncate">{r.original_filename}</p>
                      <p className="text-slate-400 text-[10px]">{r.parsed_profile?.skills?.length || 0} skills extracted</p>
                    </div>
                    <Badge variant="green">Ready</Badge>
                  </div>
                ))}
                <Link to="/resumes" className="block text-center text-xs font-semibold text-indigo-600 hover:underline pt-1">
                  Manage Resumes
                </Link>
              </div>
            )}
          </Card>

          <Card className="bg-gradient-to-br from-indigo-50 to-slate-50 border-indigo-100 p-5 space-y-3">
            <h4 className="font-bold text-indigo-900 text-sm">Placement Prep Tip</h4>
            <p className="text-xs text-indigo-950/80 leading-relaxed">
              Target Technical & System Design interviews with 20-minute sessions to practice time management before real campus interviews.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};
