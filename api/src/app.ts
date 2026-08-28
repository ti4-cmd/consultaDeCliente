import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import type { AppConfig } from './config/env.js';
import { AuthenticateUser, LookupCustomer } from './application/use-cases.js';
import { JwtTokenService } from './infrastructure/auth.js';
import { SankhyaCustomerGateway } from './infrastructure/sankhya-gateway.js';
import { errorHandler } from './http/middleware.js';
import { createRoutes } from './http/routes.js';

export function createApp(config: AppConfig) {
  const tokenService = new JwtTokenService(config);
  const sankhyaGateway = new SankhyaCustomerGateway(config);
  const authenticateUser = new AuthenticateUser(sankhyaGateway, tokenService);
  const lookupCustomer = new LookupCustomer(sankhyaGateway);
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: config.APP_ORIGIN }));
  app.use(express.json({ limit: '20kb' }));
  app.use(createRoutes(authenticateUser, lookupCustomer, tokenService));
  app.use(errorHandler);
  return app;
}
