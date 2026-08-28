import jwt from 'jsonwebtoken';
import type { AppConfig } from '../config/env.js';
import type { TokenService } from '../domain/ports.js';

export class JwtTokenService implements TokenService {
  constructor(private readonly config: AppConfig) {}

  issue(subject: string): string {
    return jwt.sign({ sub: subject }, this.config.SESSION_SECRET, { expiresIn: '8h' });
  }

  verify(token: string): string {
    const payload = jwt.verify(token, this.config.SESSION_SECRET);
    if (typeof payload === 'string' || !payload.sub || typeof payload.sub !== 'string') throw new Error('Invalid token');
    return payload.sub;
  }
}
