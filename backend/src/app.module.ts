import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { appConfig } from './config/app.config';
import { typeOrmConfig } from './config/typeorm.config';
import { RasCameraModule } from './ras-camera/ras-camera.module';
import { RasRadarModule } from './ras-radar/ras-radar.module';
import { ScanMissionModule } from './scan-mission/scan-mission.module';

@Module({
  imports: [
    ConfigModule.forRoot(appConfig),
    TypeOrmModule.forRootAsync(typeOrmConfig),
    RasCameraModule,
    RasRadarModule,
    ScanMissionModule,
  ],
  providers: [Logger],
})
export class AppModule {}
