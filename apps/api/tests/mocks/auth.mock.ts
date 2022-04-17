import { AuthService } from '../../src/auth/auth.service';
import { MockClass } from './mock.type';

export const authService: MockClass<AuthService> = {
  limited: jest.fn().mockResolvedValue({
    canActivate: true,
    used: 0,
    limit: 999,
    resetTime: 999,
  }),
  createKey: jest.fn().mockResolvedValue('618a96fec8b0493fa89427891049550b'),
};
