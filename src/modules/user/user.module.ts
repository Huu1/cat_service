import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { Role } from './entities/role.entity';
import { BookModule } from '../book/book.module';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role]),
    BookModule,
  ],
  providers: [UserService],
  exports: [UserService],
  controllers: [UserController],

})
export class UserModule {}