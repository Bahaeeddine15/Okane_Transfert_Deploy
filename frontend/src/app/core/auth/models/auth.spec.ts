import { LoginRequest } from './auth';

describe('LoginRequest', () => {
  it('should accept valid login data', () => {
    const request: LoginRequest = {
      email: 'client@example.com',
      password: 'secret',
    };

    expect(request.email).toBe('client@example.com');
  });
});
