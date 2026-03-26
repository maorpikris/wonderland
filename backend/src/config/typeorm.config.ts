import { ConfigType } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import dbConfig from './db.config';

export const typeOrmConfig: TypeOrmModuleAsyncOptions = {
  inject: [dbConfig.KEY],
  useFactory: (config: ConfigType<typeof dbConfig>) => ({
    type: 'postgres',
    retryAttempts: 10,
    host: config.host,
    port: config.port,
    username: config.username,
    password: config.password,
    database: config.database,
    entities: [__dirname + '/../**/*.entity.{ts,js}'],
    synchronize: false,
    namingStrategy: new SnakeNamingStrategy(),
  }),
};
