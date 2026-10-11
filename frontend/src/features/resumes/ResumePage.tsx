import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../lib/api';
import { Resume } from '../../types';
import { Card, Badge } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { UploadCloud, FileText, Trash2, CheckCircle2, AlertCircle, Sparkles, Layers, Code, Briefcase, GraduationCap } from 'lucide-react';

export const ResumePage: React.FC = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadResumes();
  }, []);

  async function loadResumes() {
    try {
      const list = await api.listResumes();
      setResumes(list);
      if (list.length > 0 && !selectedResume) {
        setSelectedResume(list[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load resumes');
    }
  }

  const handleFileUpload = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'pdf' && ext !== 'docx' && ext !== 'doc') {
      setError('Only PDF and DOCX resume formats are supported.');
      return;
    }
    setError('');
    setUploading(true);
    try {
      const newResume = await api.uploadResume(file);
      setResumes(prev => [newResume, ...prev]);
      setSelectedResume(newResume);
    } catch (err: any) {
      setError(err.message || 'Failed to parse resume file.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this resume?')) return;
    try {
      await api.deleteResume(id);
      setResumes(prev => prev.filter(r => r.id !== id));
      if (selectedResume?.id === id) {
        setSelectedResume(resumes.find(r => r.id !== id) || null);
      }
    } catch (err: any) {
      setError('Could not delete resume');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <FileText className="w-6 h-6 text-indigo-600" />
          <span>Resume Management & Extraction</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Upload your latest resume. Our parser automatically structures your technical skills, projects, and work experience for AI interviews.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Drag & Drop Upload Zone */}
      <Card>
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            dragActive ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".pdf,.docx,.doc"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
          />

          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center mb-3 shadow-xs">
            <UploadCloud className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-slate-900 text-base mb-1">
            {uploading ? 'Parsing Resume Document...' : 'Click to Upload or Drag & Drop'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            Supports PDF and DOCX files up to 10MB.
          </p>
          <Button size="sm" isLoading={uploading} type="button">
            Select Document
          </Button>
        </div>
      </Card>

      {/* Resumes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Uploaded Files List */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center justify-between">
            <span>Your Uploaded Resumes ({resumes.length})</span>
          </h3>

          {resumes.length === 0 ? (
            <Card className="p-6 text-center text-xs text-slate-400">
              No resumes uploaded yet.
            </Card>
          ) : (
            <div className="space-y-3">
              {resumes.map(resume => (
                <div
                  key={resume.id}
                  onClick={() => setSelectedResume(resume)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    selectedResume?.id === resume.id
                      ? 'bg-indigo-50/70 border-indigo-300 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="truncate">
                      <p className="font-bold text-xs text-slate-900 truncate">{resume.original_filename}</p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(resume.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={resume.status === 'ready' ? 'green' : 'yellow'}>
                      {resume.status}
                    </Badge>
                    <button
                      onClick={(e) => handleDelete(resume.id, e)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                      title="Delete Resume"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Parsed Profile Preview */}
        <div className="lg:col-span-2">
          {selectedResume && selectedResume.parsed_profile ? (
            <Card className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>Extracted Profile Breakdown</span>
                  </h3>
                  <p className="text-xs text-slate-500">{selectedResume.original_filename}</p>
                </div>
                <Badge variant="green">Parsed Successfully</Badge>
              </div>

              {/* Candidate Summary */}
              {selectedResume.parsed_profile.summary && (
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Executive Summary</h4>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200/60">
                    {selectedResume.parsed_profile.summary}
                  </p>
                </div>
              )}

              {/* Skills Badge Cloud */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Technical & Core Skills ({selectedResume.parsed_profile.skills.length})</span>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedResume.parsed_profile.skills.map((skill, i) => (
                    <span key={i} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-medium rounded-lg">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Extracted Projects */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Extracted Projects</span>
                </h4>
                <div className="space-y-3">
                  {selectedResume.parsed_profile.projects.map((proj, i) => (
                    <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-200/60">
                      <p className="font-bold text-xs text-slate-900">{proj.title}</p>
                      <p className="text-xs text-slate-600 mt-1">{proj.description}</p>
                      {proj.technologies && proj.technologies.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {proj.technologies.map((t, idx) => (
                            <span key={idx} className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded font-mono text-slate-600">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Education */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Education</span>
                </h4>
                <div className="space-y-2">
                  {selectedResume.parsed_profile.education.map((edu, i) => (
                    <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 text-xs">
                      <p className="font-bold text-slate-900">{edu.degree}</p>
                      <p className="text-slate-500">{edu.institution} • {edu.year || '2025'}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-12 text-center text-slate-400">
              Select an uploaded resume to inspect extracted skills and projects.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
