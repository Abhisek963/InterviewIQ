import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../../types';
import { api } from '../../lib/api';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, fullName?: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const profile = await api.getUserProfile();
        setUser(profile);
      } catch (err) {
        // Fallback default dev profile if backend starts fresh
        setUser({
          id: '00000000-0000-0000-0000-000000000001',
          full_name: 'Student Candidate',
          college_name: 'Tech University',
          graduation_year: 2026
        });
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const login = async (email: string, fullName?: string) => {
    setLoading(true);
    const mockId = `dev-token-${Date.now().toString(36)}`;
    localStorage.setItem('interviewiq_dev_token', mockId);
    try {
      const updated = await api.updateUserProfile({
        full_name: fullName || email.split('@')[0]
      });
      setUser(updated);
    } catch (e) {
      setUser({
        id: mockId,
        full_name: fullName || email.split('@')[0]
      });
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('interviewiq_dev_token');
    setUser(null);
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    const updated = await api.updateUserProfile(data);
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
