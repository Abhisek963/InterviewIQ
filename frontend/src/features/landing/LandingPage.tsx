import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, ArrowRight, ShieldCheck, Sparkles, BarChart3, FileSearch, CheckCircle2, Clock } from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-24 lg:pb-32 bg-gradient-to-b from-indigo-50/60 via-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100/80 border border-indigo-200 text-indigo-800 text-xs font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Next-Gen Placement Preparation for College Students</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
              Ace Your Technical Interviews with <span className="text-indigo-600">Resume-Aware AI</span>
            </h1>

            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              InterviewIQ analyzes your resume, customizes questions for target tech roles and companies, conducts realistic AI mock sessions, and generates a personalized 7-day practice plan.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                <span>Start Free Practice Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl border border-slate-300 shadow-xs transition-all"
              >
                Try Demo Account
              </Link>
            </div>

            <div className="mt-12 flex items-center justify-center gap-8 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>PDF & DOCX Parser</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Deterministic Scoring</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Zero Fake Data</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-20 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Everything You Need for Campus Placements</h2>
            <p className="mt-3 text-slate-600">Designed specifically for entry-level software engineering candidates, campus recruits, and intern applicants.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/60 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-6 shadow-sm">
                <FileSearch className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Resume-Targeted Questions</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                PyMuPDF & docx parsers extract your exact projects, tech stack, and experience so questions test what you actually built.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/60 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-6 shadow-sm">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Interactive AI Interviewer</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Adapts difficulty on the fly, asks relevant follow-ups, and conducts structured technical, behavioral, or HR rounds.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/60 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-6 shadow-sm">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Deterministic Scoring & 7-Day Plan</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Evaluates correctness, clarity, depth, and structure with explicit rubric weighting. Get concrete stronger answer examples.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">4 Simple Steps to Placement Success</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Upload Resume', desc: 'PDF or DOCX resume parsing extracts your projects and tech stack.' },
              { step: '02', title: 'Choose Target Role', desc: 'Select target company, role, difficulty, and interview type.' },
              { step: '03', title: 'Take AI Mock', desc: 'Answer interactive questions one by one with session state recovery.' },
              { step: '04', title: 'Get Evaluation Report', desc: 'Detailed score breakdown, missing concepts, and 7-day practice roadmap.' }
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 relative">
                <span className="text-3xl font-extrabold text-indigo-200 block mb-2">{item.step}</span>
                <h4 className="font-bold text-slate-900 mb-2">{item.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
