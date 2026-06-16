import { UserRole } from './user';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  id: number;
  username?: string;
  email: string;
  role: UserRole | string;
  token?: string;
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthTokensResponse {
  token?: string;
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface BaseUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
}

export interface ClientRegisterRequest extends BaseUserRequest {
  cin: string;
}

export interface ClientResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  cin: string;
  role?: UserRole | string;
  enabled?: boolean;
}

export interface UserResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: UserRole | string;
  enabled: boolean;
}