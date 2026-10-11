import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { Resume } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Sparkles, Building, Briefcase, Clock, ShieldCheck, FileText, AlertCircle, Play } from 'lucide-react';

export const InterviewConfigPage: React.FC = () => {
  const navigate = useNavigate();

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [companyName, setCompanyName] = useState('Google');
  const [jobTitle, setJobTitle] = useState('Software Development Engineer');
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
        const readyList = list.filter(r => r.status === 'ready');
        setResumes(readyList);
        if (readyList.length > 0) {
          setSelectedResumeId(readyList[0].id);
        }
      } catch (err: any) {
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
    if (!companyName || !jobTitle) {
      setError('Target company and job title are required.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const session = await api.createInterview({
        resume_id: selectedResumeId,
        company_name: companyName,
        job_title: jobTitle,
        interview_type: interviewType,
        difficulty: difficulty,
        duration_minutes: duration
      });

      // Start session & navigate to interview room
      await api.startInterview(session.id);
      navigate(`/interview/room/${session.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create interview session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Interview Configuration</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Setup Your AI Mock Interview</h1>
        <p className="text-sm text-slate-600 mt-1">
          Customize target company expectations, role, duration, and question depth.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleStartInterview} className="space-y-6">
        {/* Step 1: Resume Selection */}
        <Card className="space-y-4">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 border-b border-slate-100 pb-3">
            <FileText className="w-5 h-5 text-indigo-600" />
            <span>1. Select Resume Context</span>
          </h3>

          {fetchingResumes ? (
            <p className="text-xs text-slate-400">Loading resumes...</p>
          ) : resumes.length === 0 ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-2">
              <p className="font-semibold">No ready resume found</p>
              <p>Please upload a resume first so the AI can build questions targeted to your actual projects.</p>
              <Button type="button" size="sm" onClick={() => navigate('/resumes')}>
                Go to Resume Parser
              </Button>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Active Resume Document</label>
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {resumes.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.original_filename} ({r.parsed_profile?.skills?.length || 0} extracted skills)
                  </option>
                ))}
              </select>
            </div>
          )}
        </Card>

        {/* Step 2: Role & Company */}
        <Card className="space-y-4">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building className="w-5 h-5 text-indigo-600" />
            <span>2. Target Role & Company</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name</label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Google, Amazon, Microsoft, Infosys"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Job Title / Role</label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Software Engineer, Backend Intern"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Step 3: Interview Type, Difficulty, Duration */}
        <Card className="space-y-6">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 border-b border-slate-100 pb-3">
            <Clock className="w-5 h-5 text-indigo-600" />
            <span>3. Round Parameters & Difficulty</span>
          </h3>

          {/* Interview Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Interview Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'technical', label: 'Technical', desc: 'CS Data Structures, Coding, System Design' },
                { id: 'behavioral', label: 'Behavioral', desc: 'STAR method, teamwork, decision-making' },
                { id: 'HR', label: 'HR Round', desc: 'Cultural fit, career goals, candidate background' },
                { id: 'mixed', label: 'Mixed Round', desc: 'Comprehensive mix of tech & behavioral' }
              ].map(item => (
                <div
                  key={item.id}
                  onClick={() => setInterviewType(item.id as any)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    interviewType === item.id
                      ? 'bg-indigo-50/80 border-indigo-600 text-indigo-900 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <p className="font-bold text-xs">{item.label}</p>
                  <p className="text-[10px] text-slate-500 mt-1 leading-tight">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Difficulty selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Difficulty Level</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'beginner', label: 'Beginner', desc: 'Campus Placement Entry Level' },
                { id: 'intermediate', label: 'Intermediate', desc: 'Standard SDE-1 / Product Tech' },
                { id: 'advanced', label: 'Advanced', desc: 'Rigorous Deep Dive & Architecture' }
              ].map(item => (
                <div
                  key={item.id}
                  onClick={() => setDifficulty(item.id as any)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all text-center ${
                    difficulty === item.id
                      ? 'bg-indigo-50/80 border-indigo-600 text-indigo-900 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <p className="font-bold text-xs">{item.label}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Duration selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Target Duration & Question Count</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { dur: 10, count: 5, label: '10 Mins (5 Questions)' },
                { dur: 20, count: 7, label: '20 Mins (7 Questions)' },
                { dur: 30, count: 10, label: '30 Mins (10 Questions)' }
              ].map(item => (
                <div
                  key={item.dur}
                  onClick={() => setDuration(item.dur)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all text-center ${
                    duration === item.dur
                      ? 'bg-indigo-50/80 border-indigo-600 text-indigo-900 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <p className="font-bold text-xs">{item.label}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Recommended practice</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Button
          type="submit"
          size="lg"
          isLoading={loading}
          disabled={!selectedResumeId}
          className="w-full py-4 text-base font-bold shadow-lg gap-2"
        >
          <Play className="w-5 h-5 fill-white" />
          <span>Launch Interactive AI Mock Interview</span>
        </Button>
      </form>
    </div>
  );
};
