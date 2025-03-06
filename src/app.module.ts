import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MysqlModule } from './modules/mysql/mysql.module';
import { RedisModule } from './modules/redis/redis.module';
// import { DatabaseModule } from './modules/database/database.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { LogModule } from './modules/log/log.module';
import { SystemModule } from './modules/system/system.module';
import { CategoryModule } from './modules/category/category.module';
import { AccountModule } from './modules/account/account.module';
import { AccountTemplateModule } from './modules/account-template/account-template.module';
import { BookModule } from './modules/book/book.module';
import { RecordModule } from './modules/record/record.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MysqlModule,
    RedisModule,
    UserModule,
    AuthModule,
    // DatabaseModule,
    LogModule,
    SystemModule,
    CategoryModule,
    AccountModule,
    AccountTemplateModule,
    BookModule,
    RecordModule
  ],
})
export class AppModule {}
