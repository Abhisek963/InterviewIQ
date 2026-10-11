import React from 'react';
import { Brain, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                <Brain className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-slate-900">InterviewIQ</span>
            </div>
            <p className="text-sm text-slate-600 max-w-sm mb-4">
              Empowering college students and job seekers with realistic, resume-aware AI mock interviews and actionable 7-day practice plans.
            </p>
            <p className="text-xs text-slate-400">
              © {new Date().getFullYear()} InterviewIQ Platform. All rights reserved.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 text-sm mb-3">Platform</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><a href="/dashboard" className="hover:text-indigo-600">Dashboard</a></li>
              <li><a href="/resumes" className="hover:text-indigo-600">Resume Parser</a></li>
              <li><a href="/interview/new" className="hover:text-indigo-600">Mock Interview</a></li>
              <li><a href="/history" className="hover:text-indigo-600">Performance Reports</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 text-sm mb-3">Support & Legal</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><a href="#" className="hover:text-indigo-600">Documentation</a></li>
              <li><a href="#" className="hover:text-indigo-600">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-indigo-600">Terms of Service</a></li>
              <li><a href="#" className="hover:text-indigo-600">Contact Support</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500">
          <p>Built for campus placements & software engineering candidates.</p>
          <div className="flex items-center gap-1 mt-2 sm:mt-0">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <span>for job seekers worldwide</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
