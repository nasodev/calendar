'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { login as authLogin, logout as authLogout, getIdToken } from '@/lib/auth';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setState({ user, loading: false, error: null });
    });
    return unsubscribe;
  }, []);

  const login = async (name: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      await authLogin(name, password);
    } catch (err) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: '이름 또는 비밀번호가 틀렸습니다'
      }));
      throw err;
    }
  };

  const logout = async () => {
    await authLogout();
  };

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    login,
    logout,
    getIdToken,
  };
}
