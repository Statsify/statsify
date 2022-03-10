import { AuthService } from '../../src/auth/auth.service';
import { MockClass } from './mock.type';

export const authService: MockClass<AuthService> = {
  limited: jest.fn().mockResolvedValue(true),
};
