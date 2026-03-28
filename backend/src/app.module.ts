import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { appConfig } from './config/app.config';
import { typeOrmConfig } from './config/typeorm.config';
import { CameraModule } from './camera/camera.module';
import { SelfLocationModule } from './self-location/self-location.module';
import DHCPService from './dhcp';

@Module({
  imports: [
    ConfigModule.forRoot(appConfig),
    TypeOrmModule.forRootAsync(typeOrmConfig),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/static',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'recordings'),
      serveRoot: '/recordings',
    }),
    CameraModule,
    SelfLocationModule,
  ],
  providers: [Logger, /*DHCPService*/],
})
export class AppModule {}
