import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './modules/health/health.module';
import { OpportunitiesModule } from './modules/opportunities/opportunities.module';
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
    HealthModule,
    OpportunitiesModule,
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
