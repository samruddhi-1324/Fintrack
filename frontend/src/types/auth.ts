export interface User {
  id: string;
  email: string;
  full_name?: string | null;
  avatar_url?: string | null;
  is_verified: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface UserRegisterPayload {
  email: string;
  password: string;
  full_name?: string;
}

export interface UserLoginPayload {
  email: string;
  password: string;
}

export interface GoogleAuthPayload {
  credential: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  new_password: string;
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (payload: UserLoginPayload) => Promise<void>;
  register: (payload: UserRegisterPayload) => Promise<void>;
  googleLogin: (credential: string) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ detail: string; reset_token?: string }>;
  resetPassword: (payload: ResetPasswordPayload) => Promise<void>;
  changePassword: (payload: ChangePasswordPayload) => Promise<void>;
}
