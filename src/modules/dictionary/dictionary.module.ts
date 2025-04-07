import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DictType } from './entities/dict-type.entity';
import { DictItem } from './entities/dict-item.entity';
import { DictTypeService } from './services/dict-type.service';
import { DictItemService } from './services/dict-item.service';
import { DictTypeController } from './controllers/dict-type.controller';
import { DictItemController } from './controllers/dict-item.controller';
import { UserModule } from '../user/user.module';  // 添加这行

@Module({
  imports: [
    TypeOrmModule.forFeature([DictType, DictItem]),
    UserModule,  // 添加这行
  ],
  controllers: [DictTypeController, DictItemController],
  providers: [DictTypeService, DictItemService],
  exports: [DictTypeService, DictItemService],
})
export class DictionaryModule {}