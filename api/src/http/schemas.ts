import { z } from 'zod';

export const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });
export const lookupSchema = z.object({
  personType: z.enum(['PF', 'PJ']),
  document: z.string().min(11).max(18)
});
