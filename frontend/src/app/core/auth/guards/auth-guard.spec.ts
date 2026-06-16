import { authRoleGuard } from './auth-guard';

describe('authRoleGuard', () => {
  it('should create a guard for the allowed roles', () => {
    expect(authRoleGuard(['ADMIN'])).toBeTypeOf('function');
  });
});
