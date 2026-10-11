import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../../types';
import { api } from '../../lib/api';
import { supabase } from '../../lib/supabase';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, collegeName?: string) => Promise<{ requiresVerification?: boolean }>;
  demoLogin: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync user state on startup and on Supabase auth change
  useEffect(() => {
    let isMounted = true;

    async function initializeSession() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (session?.user) {
          try {
            const profile = await api.getUserProfile();
            if (isMounted) setUser(profile);
          } catch {
            if (isMounted) {
              setUser({
                id: session.user.id,
                full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Candidate',
                college_name: session.user.user_metadata?.college_name || '',
                graduation_year: 2026,
              });
            }
          }
        } else if (localStorage.getItem('interviewiq_dev_token')) {
          try {
            const profile = await api.getUserProfile();
            if (isMounted) setUser(profile);
          } catch {
            if (isMounted) setUser(null);
          }
        } else {
          if (isMounted) setUser(null);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initializeSession();

    // Listen to Supabase auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        try {
          const profile = await api.getUserProfile();
          if (isMounted) setUser(profile);
        } catch {
          if (isMounted) {
            setUser({
              id: session.user.id,
              full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Candidate',
              college_name: session.user.user_metadata?.college_name || '',
              graduation_year: 2026,
            });
          }
        }
      } else if (!localStorage.getItem('interviewiq_dev_token')) {
        if (isMounted) setUser(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        if (error.message.toLowerCase().includes('invalid login credentials')) {
          throw new Error('No account found with this email, or password is incorrect. Please register first.');
        }
        if (error.message.toLowerCase().includes('email not confirmed')) {
          throw new Error('Your email address has not been confirmed yet. Please verify your email via the confirmation link sent by Supabase.');
        }
        throw new Error(error.message);
      }

      if (data.session) {
        localStorage.removeItem('interviewiq_dev_token');
        try {
          const profile = await api.getUserProfile();
          setUser(profile);
        } catch {
          setUser({
            id: data.user.id,
            full_name: data.user.user_metadata?.full_name || email.split('@')[0],
            college_name: data.user.user_metadata?.college_name || '',
            graduation_year: 2026,
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    fullName: string,
    collegeName?: string
  ): Promise<{ requiresVerification?: boolean }> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          data: {
            full_name: fullName.trim(),
            college_name: collegeName?.trim() || '',
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.session) {
        localStorage.removeItem('interviewiq_dev_token');
        try {
          const profile = await api.updateUserProfile({
            full_name: fullName.trim(),
            college_name: collegeName?.trim() || '',
          });
          setUser(profile);
        } catch {
          setUser({
            id: data.user?.id || 'new-user',
            full_name: fullName.trim(),
            college_name: collegeName?.trim() || '',
            graduation_year: 2026,
          });
        }
        return { requiresVerification: false };
      }

      // If email verification is enabled on Supabase project
      return { requiresVerification: true };
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async () => {
    setLoading(true);
    try {
      const mockId = `dev-token-demo-${Date.now().toString(36)}`;
      localStorage.setItem('interviewiq_dev_token', mockId);
      try {
        const updated = await api.updateUserProfile({
          full_name: 'Demo Student Candidate',
          college_name: 'Tech University',
        });
        setUser(updated);
      } catch {
        setUser({
          id: mockId,
          full_name: 'Demo Student Candidate',
          college_name: 'Tech University',
          graduation_year: 2026,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    localStorage.removeItem('interviewiq_dev_token');
    setUser(null);
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    const updated = await api.updateUserProfile(data);
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, demoLogin, logout, updateProfile }}>
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
