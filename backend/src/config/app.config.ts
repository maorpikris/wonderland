import { ConfigModuleOptions } from '@nestjs/config';
import dbConfig from './db.config';

export const appConfig: ConfigModuleOptions = {
  isGlobal: true,
  envFilePath: '.env',
  load: [dbConfig],
};
