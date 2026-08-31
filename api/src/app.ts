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
  const allowedOrigins = config.APP_ORIGIN.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
    .map((origin) => (origin.endsWith('/') ? origin.slice(0, -1) : origin));

  const isDomainOrigin = (origin: string) =>
    /^https?:\/\/([a-z0-9-]+\.)+[a-z]{2,}(:\d+)?$/i.test(origin);

  const isLocalNetworkOrigin = (origin: string) =>
    /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0|192\.168\.|172\.|169\.254\.)(:\d+)?$/i.test(origin);

  const isExplicitlyAllowed = (origin: string) => allowedOrigins.includes(origin);

  const app = express();
  app.use(helmet());
  app.use(
    cors({
      origin: (requestOrigin, callback) => {
        if (!requestOrigin) {
          callback(null, true);
          return;
        }

        const normalizedOrigin = requestOrigin.endsWith('/') ? requestOrigin.slice(0, -1) : requestOrigin;

        if (isExplicitlyAllowed(normalizedOrigin) || isLocalNetworkOrigin(normalizedOrigin) || isDomainOrigin(normalizedOrigin)) {
          callback(null, true);
          return;
        }

        callback(new Error(`CORS blocked for origin: ${requestOrigin}`));
      },
      credentials: true,
    })
  );
  app.use(express.json({ limit: '20kb' }));
  app.use(createRoutes(authenticateUser, lookupCustomer, tokenService));
  app.use(errorHandler);
  return app;
}
