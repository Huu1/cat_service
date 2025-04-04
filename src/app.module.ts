import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MysqlModule } from './modules/mysql/mysql.module';
import { RedisModule } from './modules/redis/redis.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { LogModule } from './modules/log/log.module';
import { CategoryModule } from './modules/category/category.module';
import { AccountModule } from './modules/account/account.module';
import { AccountTemplateModule } from './modules/account-template/account-template.module';
import { BookModule } from './modules/book/book.module';
import { RecordModule } from './modules/record/record.module';
import { StatisticsModule } from './modules/statistics/statistics.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { PermissionGuard } from './modules/auth/guards/permission.guard';
import { DatabaseModule } from './modules/database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // 根据环境加载对应的配置文件
      envFilePath:
        process.env.NODE_ENV === 'production'
          ? '.env.production'
          : '.env.development',
    }),
    MysqlModule,
    RedisModule,
    UserModule,
    AuthModule,
    DatabaseModule,
    LogModule,
    CategoryModule,
    AccountModule,
    AccountTemplateModule,
    BookModule,
    RecordModule,
    StatisticsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
  ],
})
export class AppModule {}
