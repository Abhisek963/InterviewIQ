import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { InterviewSession, InterviewReport } from '../../types';
import { Card, Badge } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { History, Award, Play, Calendar, Building, Briefcase } from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [reports, setReports] = useState<InterviewReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [sList, rList] = await Promise.all([
          api.listInterviews(),
          api.listReports()
        ]);
        setSessions(sList);
        setReports(rList);
      } catch (err) {
        console.error('Failed to load history:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <History className="w-6 h-6 text-indigo-600" />
          <span>Interview History & Archives</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review past mock interview sessions, historical score trends, and individual question feedback.
        </p>
      </div>

      {loading ? (
        <Card className="p-12 text-center text-slate-400">Loading interview records...</Card>
      ) : sessions.length === 0 ? (
        <Card className="p-12 text-center space-y-4">
          <History className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800">No Past Interviews Recorded</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Launch an AI mock interview session to start tracking your progress over time.
          </p>
          <Link to="/interview/new">
            <Button size="sm">Start First Interview</Button>
          </Link>
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Company & Role</th>
                  <th className="py-3.5 px-6">Type & Difficulty</th>
                  <th className="py-3.5 px-6">Date</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Score</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80 text-xs">
                {sessions.map(session => {
                  const report = reports.find(r => r.session_id === session.id);
                  return (
                    <tr key={session.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-medium text-slate-900">
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-indigo-600" />
                          <div>
                            <p className="font-bold text-slate-900">{session.company_name}</p>
                            <p className="text-[11px] text-slate-500">{session.job_title}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-slate-600 capitalize">
                        <span>{session.interview_type} • {session.difficulty}</span>
                      </td>

                      <td className="py-4 px-6 text-slate-500">
                        {new Date(session.created_at).toLocaleDateString()}
                      </td>

                      <td className="py-4 px-6">
                        <Badge variant={session.status === 'completed' ? 'green' : session.status === 'in_progress' ? 'indigo' : 'slate'}>
                          {session.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </td>

                      <td className="py-4 px-6 font-bold text-slate-900">
                        {report && report.overall_score !== undefined ? `${report.overall_score}/100` : '—'}
                      </td>

                      <td className="py-4 px-6 text-right">
                        {session.status === 'completed' && report ? (
                          <Link to={`/report/${session.id}`}>
                            <Button size="sm" variant="outline" className="gap-1.5">
                              <Award className="w-3.5 h-3.5 text-indigo-600" />
                              <span>View Report</span>
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
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
