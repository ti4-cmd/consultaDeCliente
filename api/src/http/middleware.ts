import type { NextFunction, Request, Response } from 'express';
import { UnauthorizedError } from '../application/errors.js';
import type { TokenService } from '../domain/ports.js';

export type AuthenticatedRequest = Request & { user?: string };

export function authentication(tokenService: TokenService) {
  return (request: AuthenticatedRequest, _response: Response, next: NextFunction) => {
    const token = request.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (!token) return next(new UnauthorizedError());
    try {
      request.user = tokenService.verify(token);
      next();
    } catch {
      next(new UnauthorizedError());
    }
  };
}

export function errorHandler(error: unknown, _request: Request, response: Response, _next: NextFunction) {
  if (error instanceof UnauthorizedError) return response.status(401).json({ message: error.message });
  console.error(error);
  return response.status(500).json({ message: 'Erro interno do servidor.' });
}
