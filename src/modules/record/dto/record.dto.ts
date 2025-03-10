import { IsString, IsEnum, IsNumber, IsDate, IsOptional, Length, Min, registerDecorator } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RecordType } from '../entities/record.entity';
import { Type } from 'class-transformer';

export class CreateRecordDto {

  @ApiProperty({ description: '金额', example: 100.00 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Type(() => Number)
  amount: number;

  @ApiProperty({ 
      description: '记账日期',
      example: '2024-03-01T00:00:00.000Z'  // 添加示例格式
    })
    @Type(() => Date)
    @IsDate()
    @IsNotFutureDate()
    recordDate: Date;

  @ApiProperty({ description: '备注', required: false })
  @IsString()
  @IsOptional()
  note?: string;

  @ApiProperty({ description: '账本ID' })
  @IsNumber()
  bookId: number;

  @ApiProperty({ description: '账户ID' })
  @IsNumber()
  accountId: number;

  @ApiProperty({ description: '分类ID' })
  @IsNumber()
  categoryId: number;

  @ApiProperty({ description: '记录类型', enum: RecordType })
  @IsEnum(RecordType)
  type: RecordType;
}

export class UpdateRecordDto extends CreateRecordDto {
  @ApiProperty({ description: '记录类型', enum: RecordType })
  @IsEnum(RecordType)
  type: RecordType; // 显式声明继承的字段
}

// 自定义装饰器，验证日期不能是未来时间
export function IsNotFutureDate() {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isNotFutureDate',
      target: object.constructor,
      propertyName: propertyName,
      options: {
        message: '日期不能是未来时间',
      },
      validator: {
        validate(value: any) {
          return value instanceof Date && value <= new Date();
        },
      },
    });
  };
}