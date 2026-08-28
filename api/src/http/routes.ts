import { Router } from 'express';
import { ExternalServiceError, InvalidCredentialsError } from '../application/errors.js';
import { AuthenticateUser, LookupCustomer } from '../application/use-cases.js';
import { authentication } from './middleware.js';
import { loginSchema, lookupSchema } from './schemas.js';
import type { TokenService } from '../domain/ports.js';

export function createRoutes(authenticateUser: AuthenticateUser, lookupCustomer: LookupCustomer, tokenService: TokenService) {
  const router = Router();
  router.get('/health', (_request, response) => response.json({ status: 'ok' }));
  router.post('/auth/login', async (request, response, next) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) return response.status(400).json({ message: 'Informe um e-mail válido e a senha.' });
    try {
      return response.json(await authenticateUser.execute(parsed.data));
    } catch (error) {
      if (error instanceof InvalidCredentialsError) return response.status(401).json({ message: error.message });
      if (error instanceof ExternalServiceError) return response.status(502).json({ message: error.message });
      return next(error);
    }
  });
  router.post('/customers/lookup', authentication(tokenService), async (request, response, next) => {
    const parsed = lookupSchema.safeParse(request.body);
    if (!parsed.success) return response.status(400).json({ message: 'Informe um CPF ou CNPJ válido.' });
    try {
      return response.json(await lookupCustomer.execute({ ...parsed.data, document: parsed.data.document.replace(/\D/g, '') }));
    } catch (error) {
      if (error instanceof ExternalServiceError) return response.status(502).json({ message: error.message });
      return next(error);
    }
  });
  return router;
}
