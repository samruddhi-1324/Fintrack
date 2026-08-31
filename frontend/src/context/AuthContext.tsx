'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/authApi';
import { setAccessToken, getAccessToken } from '../services/api';
import {
  User, AuthContextType, UserLoginPayload,
  UserRegisterPayload, ResetPasswordPayload, ChangePasswordPayload
} from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize session on mount
  useEffect(() => {
    async function initAuth() {
      try {
        const storedToken = getAccessToken();
        if (storedToken) {
          const userData = await authApi.getMe();
          setUser(userData);
        } else {
          // Attempt refresh using HttpOnly cookie if present
          const refreshRes = await authApi.refreshToken();
          setUser(refreshRes.user);
        }
      } catch (err) {
        setUser(null);
        setAccessToken(null);
      } finally {
        setLoading(false);
      }
    }
    initAuth();
  }, []);

  const login = async (payload: UserLoginPayload) => {
    const res = await authApi.login(payload);
    setUser(res.user);
  };

  const register = async (payload: UserRegisterPayload) => {
    const res = await authApi.register(payload);
    setUser(res.user);
  };

  const googleLogin = async (credential: string) => {
    const res = await authApi.googleLogin(credential);
    setUser(res.user);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  };

  const logoutAll = async () => {
    try {
      await authApi.logoutAll();
    } finally {
      setUser(null);
    }
  };

  const forgotPassword = async (email: string) => {
    return authApi.forgotPassword(email);
  };

  const resetPassword = async (payload: ResetPasswordPayload) => {
    await authApi.resetPassword(payload);
  };

  const changePassword = async (payload: ChangePasswordPayload) => {
    await authApi.changePassword(payload);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        googleLogin,
        logout,
        logoutAll,
        forgotPassword,
        resetPassword,
        changePassword
      }}
    >
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
