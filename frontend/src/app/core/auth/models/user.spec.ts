import { AuthUser } from './user';

describe('AuthUser', () => {
  it('should accept a supported role', () => {
    const user: AuthUser = {
      id: 1,
      username: 'admin@example.com',
      role: 'ADMIN',
    };

    expect(user.role).toBe('ADMIN');
  });
});
