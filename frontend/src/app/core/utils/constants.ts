export const API_BASE_URL = 'http://localhost:8080/Okane_Transfert_war/api';

// Si ton backend est déployé en WAR avec context path :
// export const API_BASE_URL = 'http://localhost:8080/api';

export const AUTH_ENDPOINTS = {
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  VERIFY_EMAIL: '/auth/verify-email',
   REFRESH: '/auth/refresh',
};

export const CLIENT_ENDPOINTS = {
  ME: '/clients/me',
  UPDATE_PROFILE: '/clients/me/profile',
};

export const AGENT_ENDPOINTS = {
  ME: '/agents/me',
  BY_AGENCY: '/agents/agency',
};

export const ADMIN_ENDPOINTS = {
  USERS: '/admin/users',
  USERS_BY_ROLE: '/admin/users/by-role',
};

export const STORAGE_KEYS = {
  TOKEN: 'okane_token',
  REFRESH_TOKEN: 'okane_refresh_token',
  USER: 'okane_user',
};

export const ROUTES_BY_ROLE = {
  ADMIN: '/admin/dashboard',
  AGENT: '/agent/dashboard',
  CLIENT: '/client/dashboard',
};

export const LOGIN_ROUTES = {
  ADMIN: '/auth/admin/login',
  AGENT: '/auth/agent/login',
  CLIENT: '/auth/client/login',
};