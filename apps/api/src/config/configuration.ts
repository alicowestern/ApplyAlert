import { z } from 'zod';

export const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url().default('postgresql://applyalert:applyalert@localhost:5432/applyalert_dev?schema=public'),
  DEV_USER_ID: z.string().default('dev-user-id'),
  CORS_ORIGIN: z.string().default('*'),
});

export type EnvConfig = z.infer<typeof EnvSchema>;

export const configuration = () => {
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error('Invalid environment variables:', parsed.error.format());
    throw new Error('Environment configuration validation failed');
  }
  return parsed.data;
};
