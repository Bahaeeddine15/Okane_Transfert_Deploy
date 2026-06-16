import { roleGuard } from './role-guard';

describe('roleGuard', () => {
  it('should create a guard for the allowed roles', () => {
    expect(roleGuard(['AGENT'])).toBeTypeOf('function');
  });
});
