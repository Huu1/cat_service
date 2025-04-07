import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { File } from '../entities/file.entity';
import { FileQueryDto, FileDto } from '../dto/file.dto';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(File)
    private fileRepository: Repository<File>,
    private configService: ConfigService,
  ) {}

  // 获取上传目录
  private getUploadDir(): string {
    const uploadDir = this.configService.get<string>('UPLOAD_DIR', 'uploads');
    const fullPath = path.resolve(process.cwd(), uploadDir);
    
    // 确保目录存在
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
    
    return fullPath;
  }

  // 生成唯一文件名
  private generateFileName(originalName: string): string {
    const timestamp = new Date().getTime();
    const randomStr = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(originalName);
    return `${timestamp}-${randomStr}${ext}`;
  }

  // 计算文件MD5
  private async calculateMD5(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('md5');
      const stream = fs.createReadStream(filePath);
      
      stream.on('error', err => reject(err));
      stream.on('data', chunk => hash.update(chunk));
      stream.on('end', () => resolve(hash.digest('hex')));
    });
  }

  // 保存上传文件信息
  async saveFileInfo(file: Express.Multer.File, uploaderId?: string, uploaderName?: string): Promise<FileDto> {
    const uploadDir = this.getUploadDir();
    const fileName = this.generateFileName(file.originalname);
    const filePath = path.join(uploadDir, fileName);
    
    // 将临时文件移动到目标位置
    fs.copyFileSync(file.path, filePath);
    
    // 计算MD5
    const md5 = await this.calculateMD5(filePath);
    
    // 构建URL
    // 修改 URL 构建逻辑，确保包含 api 前缀
    const baseUrl = this.configService.get<string>('APP_URL', 'http://localhost:3000');
    const url = `${baseUrl}/api/uploads/${fileName}`;
    
    // 保存文件信息到数据库
    const fileEntity = this.fileRepository.create({
      originalName: file.originalname,
      fileName,
      mimeType: file.mimetype,
      size: file.size,
      path: filePath,
      url,
      md5,
      storage: 'local',
      uploaderId,
      uploaderName,
    });
    
    const savedFile = await this.fileRepository.save(fileEntity);
    
    // 删除临时文件
    fs.unlinkSync(file.path);
    
    return {
      id: savedFile.id,
      originalName: savedFile.originalName,
      fileName: savedFile.fileName,
      mimeType: savedFile.mimeType,
      size: savedFile.size,
      url: savedFile.url,
      storage: savedFile.storage,
      createdAt: savedFile.createdAt,
    };
  }

  // 查询文件列表
  async findAll(query: FileQueryDto): Promise<{ items: FileDto[], total: number }> {
    const { name, mimeType, uploaderId, page = 1, limit = 10 } = query;
    
    const where: any = {};
    if (name) {
      where.originalName = Like(`%${name}%`);
    }
    if (mimeType) {
      where.mimeType = Like(`%${mimeType}%`);
    }
    if (uploaderId) {
      where.uploaderId = uploaderId;
    }
    
    const [files, total] = await this.fileRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    
    const items = files.map(file => ({
      id: file.id,
      originalName: file.originalName,
      fileName: file.fileName,
      mimeType: file.mimeType,
      size: file.size,
      url: file.url,
      storage: file.storage,
      createdAt: file.createdAt,
      uploaderName: file.uploaderName,
    }));
    
    return { items, total };
  }

  // 根据ID查询文件
  async findOne(id: number): Promise<File> {
    const file = await this.fileRepository.findOne({ where: { id } });
    if (!file) {
      throw new NotFoundException(`文件ID ${id} 不存在`);
    }
    return file;
  }

  // 根据文件名查询文件
  async findByFileName(fileName: string): Promise<File> {
    const file = await this.fileRepository.findOne({ where: { fileName } });
    if (!file) {
      throw new NotFoundException(`文件 ${fileName} 不存在`);
    }
    return file;
  }

  // 删除文件
  async remove(id: number): Promise<void> {
    const file = await this.findOne(id);
    
    // 删除物理文件
    try {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    } catch (error) {
      throw new BadRequestException(`删除文件失败: ${error.message}`);
    }
    
    // 删除数据库记录
    await this.fileRepository.remove(file);
  }
}