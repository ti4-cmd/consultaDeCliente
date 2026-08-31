import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3333),
  HOST: z.string().trim().min(1).default('0.0.0.0'),
  APP_ORIGIN: z.string().trim().min(1).default('http://localhost:3025'),
  SESSION_SECRET: z.string().min(16),
  SANKHYA_API_URL: z.string().url(),
  SANKHYA_SERVICE_URL: z.string().url().default('https://api.sandbox.sankhya.com.br/gateway/v1/mge/service.sbr?serviceName=DbExplorerSP.executeQuery&outputType=json'),
  SANKHYA_TOKEN: z.string().optional(),
  SANKHYA_X_TOKEN: z.string().optional(),
  CLIENT_ID: z.string().min(1),
  CLIENT_SECRET: z.string().min(1),
  grant_type: z.string().default('client_credentials')
});

export type AppConfig = z.infer<typeof envSchema>;

export function loadConfig(environment: NodeJS.ProcessEnv = process.env): AppConfig {
  const parsed = envSchema.safeParse(environment);
  if (!parsed.success) {
    console.error('Invalid environment configuration', parsed.error.flatten().fieldErrors);
    process.exit(1);
  }
  return parsed.data;
}
