import { 
  Controller, 
  Get, 
  Post, 
  Delete, 
  Param, 
  Query, 
  UseInterceptors, 
  UploadedFile,
  UploadedFiles,
  Res,
  UseGuards,
  Req,
  ParseIntPipe,
  BadRequestException,
  HttpCode
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Response, Request } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { FileService } from '../services/file.service';
import { FileQueryDto } from '../dto/file.dto';
import { Permissions } from 'src/modules/auth/decorators/permissions.decorator';

@ApiTags('文件管理')
@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  
  @ApiBearerAuth()
  @ApiOperation({ summary: '上传单个文件' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './temp',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|pdf|doc|docx|xls|xlsx|txt)$/)) {
          return cb(new BadRequestException('只允许上传图片、PDF、Office文档和文本文件'), false);
        }
        cb(null, true);
      },
    }),
  )
  @HttpCode(200)
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
    if (!file) {
      throw new BadRequestException('请选择要上传的文件');
    }
    
    
    const user = req.user as any;
    return this.fileService.saveFileInfo(
      file,
      user?.id?.toString(),
      user?.username,
    );
  }

  @Post('uploads')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '上传多个文件' })
  @ApiConsumes('multipart/form-data')
  @HttpCode(200)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: './temp',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|pdf|doc|docx|xls|xlsx|txt)$/)) {
          return cb(new BadRequestException('只允许上传图片、PDF、Office文档和文本文件'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadFiles(@UploadedFiles() files: Express.Multer.File[], @Req() req: Request) {
    if (!files || files.length === 0) {
      throw new BadRequestException('请选择要上传的文件');
    }
    
    const user = req.user as any;
    const results = [];
    
    for (const file of files) {
      const result = await this.fileService.saveFileInfo(
        file,
        user?.id?.toString(),
        user?.username,
      );
      results.push(result);
    }
    
    return results;
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取文件列表' })
  async findAll(@Query() query: FileQueryDto) {
    return this.fileService.findAll(query);
  }

  @Get('download/:fileName')
  @ApiOperation({ summary: '下载文件' })
  @ApiParam({ name: 'fileName', description: '文件名' })
  async downloadFile(@Param('fileName') fileName: string, @Res() res: Response) {
    const file = await this.fileService.findByFileName(fileName);
    
    res.download(file.path, file.originalName, (err) => {
      if (err) {
        res.status(500).send({
          message: `文件下载失败: ${err.message}`,
        });
      }
    });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Permissions('file:delete')
  @ApiOperation({ summary: '删除文件' })
  @ApiParam({ name: 'id', description: '文件ID' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.fileService.remove(id);
    return { message: '文件删除成功' };
  }
}