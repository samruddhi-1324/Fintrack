import { fetchApi, setAccessToken } from './api';
import {
  UserRegisterPayload, UserLoginPayload, GoogleAuthPayload,
  ForgotPasswordPayload, ResetPasswordPayload, ChangePasswordPayload,
  TokenResponse, User
} from '../types/auth';

export const authApi = {
  async register(payload: UserRegisterPayload): Promise<TokenResponse> {
    const data = await fetchApi<TokenResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    setAccessToken(data.access_token);
    return data;
  },

  async login(payload: UserLoginPayload): Promise<TokenResponse> {
    const data = await fetchApi<TokenResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    setAccessToken(data.access_token);
    return data;
  },

  async googleLogin(credential: string): Promise<TokenResponse> {
    const data = await fetchApi<TokenResponse>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential })
    });
    setAccessToken(data.access_token);
    return data;
  },

  async refreshToken(): Promise<TokenResponse> {
    const data = await fetchApi<TokenResponse>('/auth/refresh', {
      method: 'POST'
    });
    setAccessToken(data.access_token);
    return data;
  },

  async logout(): Promise<void> {
    try {
      await fetchApi<{ detail: string }>('/auth/logout', { method: 'POST' });
    } finally {
      setAccessToken(null);
    }
  },

  async logoutAll(): Promise<void> {
    try {
      await fetchApi<{ detail: string }>('/auth/logout-all', { method: 'POST' });
    } finally {
      setAccessToken(null);
    }
  },

  async forgotPassword(email: string): Promise<{ detail: string; reset_token?: string }> {
    return fetchApi<{ detail: string; reset_token?: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },

  async resetPassword(payload: ResetPasswordPayload): Promise<{ detail: string }> {
    return fetchApi<{ detail: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async changePassword(payload: ChangePasswordPayload): Promise<{ detail: string }> {
    return fetchApi<{ detail: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async getMe(): Promise<User> {
    return fetchApi<User>('/auth/me', { method: 'GET' });
  }
};
