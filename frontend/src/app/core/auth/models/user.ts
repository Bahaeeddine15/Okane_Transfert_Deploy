export type UserRole = 'ADMIN' | 'AGENT' | 'CLIENT';

export interface AuthUser {
  id: number;
  username: string;
  email?: string;
  role: UserRole;

  firstName?: string;
  lastName?: string;
  phoneNumber?: string;

  agencyId?: number;
  agencyName?: string;

  cin?: string;
  enabled?: boolean;
}