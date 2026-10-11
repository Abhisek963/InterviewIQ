import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../lib/api';
import { Resume } from '../../types';
import {
  UploadCloud, FileText, Trash2, CheckCircle2, AlertCircle, Sparkles,
  Layers, Code, GraduationCap, ArrowUpRight, Clock, Plus
} from 'lucide-react';

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
      setError(err.message || 'Failed to parse resume document.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to remove this resume profile?')) return;
    try {
      await api.deleteResume(id);
      const remaining = resumes.filter(r => r.id !== id);
      setResumes(remaining);
      if (selectedResume?.id === id) {
        setSelectedResume(remaining[0] || null);
      }
    } catch (err: any) {
      setError('Could not delete resume document.');
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
    <div style={{ background: 'var(--color-paper)', minHeight: 'calc(100vh - 3.5rem)' }} className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[var(--color-border)]">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-[var(--color-muted)] mb-2">
              <span className="w-2 h-2 rounded-full bg-[var(--color-forest)] inline-block"></span>
              <span>[ RESUME VAULT // ATS & SKILL PARSER ]</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-[var(--color-ink)] tracking-tight">
              Candidate Resume Vault & Extraction
            </h1>
            <p className="text-sm text-[var(--color-muted)] mt-1 max-w-2xl font-sans">
              Our placement parser extracts your project details, tech stack keywords, and past internships to calibrate personalized mock interview inquiries.
            </p>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider bg-[var(--color-ink)] text-[var(--color-paper)] hover:bg-[var(--color-forest)] transition-all shadow-sm shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Upload New Resume</span>
          </button>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Upload Zone */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed p-8 sm:p-10 text-center cursor-pointer transition-all bg-white ${
            dragActive
              ? 'border-[var(--color-forest)] bg-[var(--color-forest-light)]/40'
              : 'border-[var(--color-border)] hover:border-[var(--color-ink)]'
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

          <div className="w-12 h-12 bg-[var(--color-paper-dark)] text-[var(--color-ink)] mx-auto flex items-center justify-center mb-3 border border-[var(--color-border)]">
            <UploadCloud className="w-6 h-6 text-[var(--color-forest)]" />
          </div>

          <h3 className="font-serif text-lg text-[var(--color-ink)] font-bold mb-1">
            {uploading ? 'Parsing & Extracting Profile Attributes...' : 'Drop Resume PDF / DOCX or Click to Browse'}
          </h3>
          <p className="text-xs text-[var(--color-muted)] font-mono max-w-md mx-auto mb-4">
            Supports standard ATS resume formats up to 10MB. Automatically structures skills, education, and project experiences.
          </p>

          <button
            type="button"
            disabled={uploading}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-mono uppercase tracking-wider font-bold bg-[var(--color-paper-dark)] text-[var(--color-ink)] border border-[var(--color-border)] hover:bg-[var(--color-paper)] transition-all"
          >
            {uploading ? 'Analyzing Document...' : 'Select File from Disk'}
          </button>
        </div>

        {/* Two-Column Layout: Resume List & Parsed Dossier */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Uploaded Files Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]">
              <h3 className="font-mono text-xs uppercase tracking-wider text-[var(--color-muted)] font-bold">
                Stored Documents ({resumes.length})
              </h3>
            </div>

            {resumes.length === 0 ? (
              <div className="p-8 text-center bg-white border border-[var(--color-border)] text-xs text-[var(--color-muted)] font-mono">
                No resumes in vault yet.
              </div>
            ) : (
              <div className="space-y-2">
                {resumes.map(resume => {
                  const isSelected = selectedResume?.id === resume.id;
                  return (
                    <div
                      key={resume.id}
                      onClick={() => setSelectedResume(resume)}
                      className={`p-4 border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-white border-l-4 border-l-[var(--color-forest)] border-[var(--color-border)] shadow-xs'
                          : 'bg-white/80 border-[var(--color-border)] hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <div className={`w-8 h-8 flex items-center justify-center shrink-0 border ${
                          isSelected ? 'bg-[var(--color-forest-light)] text-[var(--color-forest)] border-[var(--color-forest)]/30' : 'bg-[var(--color-paper-dark)] text-[var(--color-muted)] border-[var(--color-border)]'
                        }`}>
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-[var(--color-ink)] truncate">{resume.original_filename}</p>
                          <p className="text-[10px] text-[var(--color-muted)] font-mono">
                            {new Date(resume.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] font-mono px-2 py-0.5 uppercase tracking-wider ${
                          resume.status === 'ready'
                            ? 'bg-[var(--color-forest-light)] text-[var(--color-forest)] border border-[var(--color-forest)]/30 font-bold'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {resume.status}
                        </span>
                        <button
                          onClick={(e) => handleDelete(resume.id, e)}
                          className="p-1 text-[var(--color-muted)] hover:text-rose-600 transition-colors"
                          title="Delete Resume"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Parsed Profile Breakdown Column */}
          <div className="lg:col-span-2">
            {selectedResume && selectedResume.parsed_profile ? (
              <div className="bg-white border border-[var(--color-border)] p-6 sm:p-8 space-y-6 shadow-xs">
                
                {/* Dossier Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[var(--color-border)] gap-2">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-muted)] block mb-1">
                      [ PARSED METADATA PROFILE ]
                    </span>
                    <h2 className="font-serif text-xl font-bold text-[var(--color-ink)]">
                      {selectedResume.original_filename}
                    </h2>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider bg-[var(--color-forest-light)] text-[var(--color-forest)] border border-[var(--color-forest)]/30 font-bold self-start sm:self-auto">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    ATS Ready for Mocks
                  </span>
                </div>

                {/* Executive Summary */}
                {selectedResume.parsed_profile.summary && (
                  <div>
                    <h4 className="text-xs font-mono font-bold text-[var(--color-muted)] uppercase tracking-wider mb-2">
                      Parsed Executive Summary
                    </h4>
                    <p className="text-xs text-[var(--color-ink)] leading-relaxed bg-[var(--color-paper)] p-4 border border-[var(--color-border)] font-sans">
                      {selectedResume.parsed_profile.summary}
                    </p>
                  </div>
                )}

                {/* Technical Skills Badge Cloud */}
                <div>
                  <h4 className="text-xs font-mono font-bold text-[var(--color-muted)] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5 text-[var(--color-forest)]" />
                    <span>Technical & Domain Skills ({selectedResume.parsed_profile.skills.length})</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedResume.parsed_profile.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 bg-[var(--color-paper)] text-[var(--color-ink)] border border-[var(--color-border)] text-xs font-mono"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Extracted Projects */}
                <div>
                  <h4 className="text-xs font-mono font-bold text-[var(--color-muted)] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[var(--color-forest)]" />
                    <span>Extracted Projects & Implementations</span>
                  </h4>
                  <div className="space-y-3">
                    {selectedResume.parsed_profile.projects.map((proj, i) => (
                      <div key={i} className="p-4 bg-[var(--color-paper)] border border-[var(--color-border)] space-y-2">
                        <p className="font-bold text-xs text-[var(--color-ink)] font-mono">{proj.title}</p>
                        <p className="text-xs text-[var(--color-muted)] leading-relaxed">{proj.description}</p>
                        {proj.technologies && proj.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {proj.technologies.map((t, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] bg-white border border-[var(--color-border)] px-1.5 py-0.5 font-mono text-[var(--color-muted)]"
                              >
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
                  <h4 className="text-xs font-mono font-bold text-[var(--color-muted)] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-[var(--color-forest)]" />
                    <span>Academic Background & Degree</span>
                  </h4>
                  <div className="space-y-2">
                    {selectedResume.parsed_profile.education.map((edu, i) => (
                      <div key={i} className="p-3 bg-[var(--color-paper)] border border-[var(--color-border)] text-xs flex justify-between items-center">
                        <div>
                          <p className="font-bold text-[var(--color-ink)]">{edu.degree}</p>
                          <p className="text-[11px] text-[var(--color-muted)] font-mono">{edu.institution}</p>
                        </div>
                        <span className="text-[11px] font-mono text-[var(--color-muted)]">{edu.year || '2025'}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-white border border-[var(--color-border)] p-16 text-center space-y-3">
                <FileText className="w-10 h-10 text-[var(--color-muted)] mx-auto opacity-30" />
                <h3 className="font-serif text-lg text-[var(--color-ink)]">No Resume Profile Selected</h3>
                <p className="text-xs text-[var(--color-muted)] font-mono max-w-sm mx-auto">
                  Select a resume from the list or upload your placement CV above to inspect extracted competencies.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
