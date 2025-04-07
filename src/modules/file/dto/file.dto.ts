import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class FileDto {
  @ApiProperty({ description: '文件ID' })
  id: number;

  @ApiProperty({ description: '文件原始名称' })
  originalName: string;

  @ApiProperty({ description: '文件存储名称' })
  fileName: string;

  @ApiProperty({ description: '文件类型' })
  mimeType: string;

  @ApiProperty({ description: '文件大小(字节)' })
  size: number;

  @ApiProperty({ description: '文件访问URL' })
  url: string;

  @ApiProperty({ description: '存储位置' })
  storage: string;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;
}

export class FileQueryDto {
  @ApiProperty({ description: '文件名称', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: '文件类型', required: false })
  @IsOptional()
  @IsString()
  mimeType?: string;

  @ApiProperty({ description: '上传者ID', required: false })
  @IsOptional()
  @IsString()
  uploaderId?: string;

  @ApiProperty({ description: '页码', required: false, default: 1 })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiProperty({ description: '每页数量', required: false, default: 10 })
  @IsOptional()
  @IsNumber()
  limit?: number;
}