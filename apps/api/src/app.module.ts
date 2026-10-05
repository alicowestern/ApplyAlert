import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './modules/health/health.module';
import { OpportunitiesModule } from './modules/opportunities/opportunities.module';
import { ImportsModule } from './modules/imports/imports.module';
import { ExtractionsModule } from './modules/extractions/extractions.module';
import { RemindersModule } from './modules/reminders/reminders.module';
import { StorageModule } from './storage/storage.module';
import { PrismaModule } from './prisma/prisma.module';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { DevUserMiddleware } from './common/middleware/dev-user.middleware';
import { configuration } from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['../../.env', '.env'],
    }),
    PrismaModule,
    StorageModule,
    HealthModule,
    OpportunitiesModule,
    ImportsModule,
    ExtractionsModule,
    RemindersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestIdMiddleware, DevUserMiddleware)
      .forRoutes('*');
  }
}
