import { HttpModuleAsyncOptions } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';

const TIMEOUT = 5000;

const normalizePath = (path: string) => {
  if (!path) return '';
  return path.startsWith('/') ? path : `/${path}`;
};

export const createRasClientConfig = (
  clientPath: string,
): HttpModuleAsyncOptions => ({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    baseURL:
      configService.get<string>('RAS_API_URL', 'http://localhost:4444') +
      normalizePath(clientPath),
    timeout: TIMEOUT,
  }),
  inject: [ConfigService],
});
