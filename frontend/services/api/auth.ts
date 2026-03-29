import api from "./axios";

export interface User {
  id: string;
  name: string;
  email: string;
  provider: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
    rememberMe?: boolean;
  };
}

export interface MessageResponse {
  success: boolean;
  message: string;
}

// Manual Auth
export const signupAPI = (name: string, email: string, password: string) =>
  api.post<AuthResponse>("/api/auth/signup", { name, email, password });

export const signinAPI = (
  email: string,
  password: string,
  rememberMe?: boolean
) =>
  api.post<AuthResponse>("/api/auth/signin", { email, password, rememberMe });

// OTP Auth
export const sendOtpAPI = (email: string) =>
  api.post<MessageResponse>("/api/auth/otp/send", { email });

export const verifyOtpAPI = (email: string, otp: string) =>
  api.post<AuthResponse>("/api/auth/otp/verify", { email, otp });

export const resendOtpAPI = (email: string) =>
  api.post<MessageResponse>("/api/auth/otp/resend", { email });

// Social Auth — send id_token from popup to backend
export const googleAuthAPI = (credential: string) =>
  api.post<AuthResponse>("/api/auth/google", { credential });

export const appleAuthAPI = (id_token: string, user?: { name?: { firstName?: string; lastName?: string } }) =>
  api.post<AuthResponse>("/api/auth/apple", { id_token, user });

// Token
export const refreshTokenAPI = (refreshToken: string) =>
  api.post("/api/auth/refresh-token", { refreshToken });

// User
export const getMeAPI = () =>
  api.get<{ success: boolean; data: { user: User } }>("/api/auth/me");

export const logoutAPI = (refreshToken: string) =>
  api.post<MessageResponse>("/api/auth/logout", { refreshToken });
