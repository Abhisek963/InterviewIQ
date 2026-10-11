import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { InterviewSession, InterviewReport } from '../../types';
import { Badge } from '../../components/ui/Card';
import {
  History, Award, Play, Calendar, Building, Briefcase, Search,
  Filter, ArrowUpRight, BarChart3, CheckCircle2, Clock, AlertCircle
} from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [reports, setReports] = useState<InterviewReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

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

  const reportsBySession = useMemo(() => {
    const map = new Map<string, InterviewReport>();
    reports.forEach(r => map.set(r.session_id, r));
    return map;
  }, [reports]);

  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
      const matchesSearch =
        session.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.job_title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === 'all' || session.interview_type.toLowerCase() === typeFilter.toLowerCase();
      const matchesStatus = statusFilter === 'all' || session.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [sessions, searchQuery, typeFilter, statusFilter]);

  const validScores = reports
    .map(r => r.overall_score)
    .filter((s): s is number => s !== undefined && s !== null);
  const avgScore = validScores.length > 0 ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length) : null;
  const completedCount = sessions.filter(s => s.status === 'completed').length;
  const companiesCount = new Set(sessions.map(s => s.company_name.toLowerCase())).size;

  return (
    <div style={{ background: 'var(--color-paper)', minHeight: 'calc(100vh - 3.5rem)' }} className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[var(--color-border)]">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-[var(--color-muted)] mb-2">
              <span className="w-2 h-2 rounded-full bg-[var(--color-forest)] inline-block"></span>
              <span>[ PERFORMANCE ARCHIVE // DOSSIER ]</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-[var(--color-ink)] tracking-tight">
              Interview History & Score Ledger
            </h1>
            <p className="text-sm text-[var(--color-muted)] mt-1 max-w-2xl font-sans">
              Comprehensive log of past placement trials, technical drills, and question-level AI evaluations.
            </p>
          </div>
          
          <Link
            to="/interview/new"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider bg-[var(--color-ink)] text-[var(--color-paper)] hover:bg-[var(--color-forest)] transition-all shadow-sm shrink-0"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Launch New Mock</span>
          </Link>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-white border border-[var(--color-border)] shadow-xs">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-muted)] block mb-1">Total Mock Drills</span>
            <div className="text-2xl font-serif font-bold text-[var(--color-ink)]">{sessions.length}</div>
            <span className="text-[11px] text-[var(--color-muted)] font-mono">{completedCount} evaluated to completion</span>
          </div>
          
          <div className="p-4 bg-white border border-[var(--color-border)] shadow-xs">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-muted)] block mb-1">Mean Score</span>
            <div className="text-2xl font-serif font-bold text-[var(--color-forest)]">
              {avgScore !== null ? `${avgScore}/100` : '—'}
            </div>
            <span className="text-[11px] text-[var(--color-muted)] font-mono">Across scored sessions</span>
          </div>

          <div className="p-4 bg-white border border-[var(--color-border)] shadow-xs">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-muted)] block mb-1">Target Companies</span>
            <div className="text-2xl font-serif font-bold text-[var(--color-ink)]">{companiesCount}</div>
            <span className="text-[11px] text-[var(--color-muted)] font-mono">Distinct placement pipelines</span>
          </div>

          <div className="p-4 bg-white border border-[var(--color-border)] shadow-xs">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-muted)] block mb-1">Completion Rate</span>
            <div className="text-2xl font-serif font-bold text-[var(--color-ink)]">
              {sessions.length > 0 ? `${Math.round((completedCount / sessions.length) * 100)}%` : '0%'}
            </div>
            <span className="text-[11px] text-[var(--color-muted)] font-mono">Finished full question rounds</span>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white border border-[var(--color-border)] p-4 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-[var(--color-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by company or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-[var(--color-paper)] border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-ink)] text-[var(--color-ink)]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="flex items-center gap-1.5 text-xs text-[var(--color-muted)] font-mono">
              <Filter className="w-3.5 h-3.5" />
              <span>Track:</span>
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-xs py-1.5 px-2.5 bg-[var(--color-paper)] border border-[var(--color-border)] text-[var(--color-ink)] focus:outline-none"
            >
              <option value="all">All Tracks</option>
              <option value="technical">Technical</option>
              <option value="behavioral">Behavioral (HR)</option>
              <option value="system_design">System Design</option>
              <option value="coding">Coding Drill</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs py-1.5 px-2.5 bg-[var(--color-paper)] border border-[var(--color-border)] text-[var(--color-ink)] focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="in_progress">In Progress</option>
            </select>
          </div>
        </div>

        {/* Content Table / Cards */}
        {loading ? (
          <div className="bg-white border border-[var(--color-border)] p-16 text-center">
            <div className="inline-block w-6 h-6 border-2 border-[var(--color-forest)] border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-xs font-mono uppercase tracking-wider text-[var(--color-muted)]">
              Fetching interview ledger...
            </p>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="bg-white border border-[var(--color-border)] p-16 text-center max-w-xl mx-auto space-y-4">
            <History className="w-10 h-10 text-[var(--color-muted)] mx-auto opacity-40" />
            <h3 className="font-serif text-xl text-[var(--color-ink)]">No Sessions Recorded</h3>
            <p className="text-xs text-[var(--color-muted)] font-sans leading-relaxed">
              {searchQuery || typeFilter !== 'all' || statusFilter !== 'all'
                ? "No interview sessions matched your search filters. Try clearing the filters."
                : "You haven't initiated any mock interview sessions yet. Launch an AI interview configured for your upcoming campus placement drive."}
            </p>
            <Link
              to="/interview/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider bg-[var(--color-ink)] text-[var(--color-paper)] hover:bg-[var(--color-forest)] transition-all"
            >
              <span>Configure First Interview</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-[var(--color-border)] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--color-paper-dark)] border-b border-[var(--color-border)] text-[10px] font-mono font-semibold text-[var(--color-muted)] uppercase tracking-wider">
                    <th className="py-3 px-6">Company & Target Position</th>
                    <th className="py-3 px-6">Track & Rigor</th>
                    <th className="py-3 px-6">Recorded Date</th>
                    <th className="py-3 px-6">Status</th>
                    <th className="py-3 px-6">Score Verdict</th>
                    <th className="py-3 px-6 text-right">Dossier Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)] text-xs">
                  {filteredSessions.map(session => {
                    const report = reportsBySession.get(session.id);
                    const score = report?.overall_score;

                    return (
                      <tr key={session.id} className="hover:bg-[var(--color-paper)]/60 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-none bg-[var(--color-paper-dark)] border border-[var(--color-border)] flex items-center justify-center shrink-0">
                              <Building className="w-4 h-4 text-[var(--color-forest)]" />
                            </div>
                            <div>
                              <p className="font-bold text-[var(--color-ink)]">{session.company_name}</p>
                              <p className="text-[11px] text-[var(--color-muted)] font-mono">{session.job_title}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6 text-[var(--color-ink)]">
                          <span className="capitalize font-mono text-[11px]">{session.interview_type}</span>
                          <span className="text-[var(--color-muted)] mx-1.5">•</span>
                          <span className="capitalize font-mono text-[11px] text-[var(--color-muted)]">{session.difficulty}</span>
                        </td>

                        <td className="py-4 px-6 font-mono text-[11px] text-[var(--color-muted)]">
                          {new Date(session.created_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </td>

                        <td className="py-4 px-6">
                          {session.status === 'completed' ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-[var(--color-forest-light)] text-[var(--color-forest)] border border-[var(--color-forest)]/30 font-bold">
                              <CheckCircle2 className="w-3 h-3" />
                              COMPLETED
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-300 font-bold">
                              <Clock className="w-3 h-3" />
                              IN PROGRESS
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-6">
                          {score !== undefined && score !== null ? (
                            <div className="flex items-center gap-2">
                              <span className={`font-serif text-base font-bold ${
                                score >= 80 ? 'text-[var(--color-forest)]' : score >= 60 ? 'text-amber-700' : 'text-rose-700'
                              }`}>
                                {score}/100
                              </span>
                              <span className="text-[10px] font-mono uppercase text-[var(--color-muted)]">
                                {score >= 80 ? 'Placement Ready' : score >= 60 ? 'Competitive' : 'Needs Practice'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-[var(--color-muted)] font-mono">—</span>
                          )}
                        </td>

                        <td className="py-4 px-6 text-right">
                          {session.status === 'completed' && report ? (
                            <Link
                              to={`/report/${session.id}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[var(--color-forest)] hover:bg-[var(--color-forest-light)] border border-[var(--color-forest)]/40 transition-colors uppercase tracking-wider font-mono"
                            >
                              <Award className="w-3.5 h-3.5" />
                              <span>View Report</span>
                            </Link>
                          ) : (
                            <Link
                              to={`/interview/room/${session.id}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[var(--color-ink)] text-[var(--color-paper)] hover:bg-[var(--color-forest)] transition-colors uppercase tracking-wider font-mono"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>{session.status === 'in_progress' ? 'Resume Session' : 'Start'}</span>
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
