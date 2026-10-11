import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppProviders } from './providers';
import { AppRouter } from './router';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppProviders>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500 selection:text-white">
          <Navbar />
          <main className="flex-1">
            <AppRouter />
          </main>
          <Footer />
        </div>
      </AppProviders>
    </BrowserRouter>
  );
};
