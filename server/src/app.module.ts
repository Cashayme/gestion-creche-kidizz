import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggingMiddleware } from './logging.middleware';
import { UserModule } from './user/user.module';
import { ChildCareModule } from './child-care/child-care.module';
import { ChildModule } from './child/child.module';
import { ExportModule } from './export/export.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: './db/kidizz.db',
      entities: [`${__dirname}/**/*.entity{.ts,.js}`],
      synchronize: false, // Ne pas utiliser en production
    }),
    UserModule,
    ChildCareModule,
    ChildModule,
    ExportModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
