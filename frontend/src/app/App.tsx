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
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-paper)', color: 'var(--color-ink)' }}>
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
