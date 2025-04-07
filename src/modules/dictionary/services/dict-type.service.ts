import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DictType } from '../entities/dict-type.entity';
import { CreateDictTypeDto } from '../dto/create-dict-type.dto';
import { UpdateDictTypeDto } from '../dto/update-dict-type.dto';

@Injectable()
export class DictTypeService {
  constructor(
    @InjectRepository(DictType)
    private dictTypeRepository: Repository<DictType>,
  ) {}

  async create(createDictTypeDto: CreateDictTypeDto): Promise<DictType> {
    // 检查编码是否已存在
    const existingType = await this.dictTypeRepository.findOne({
      where: { code: createDictTypeDto.code },
    });

    if (existingType) {
      throw new ConflictException(`字典类型编码 ${createDictTypeDto.code} 已存在`);
    }

    const dictType = this.dictTypeRepository.create(createDictTypeDto);
    return this.dictTypeRepository.save(dictType);
  }

  async findAll(): Promise<DictType[]> {
    return this.dictTypeRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<DictType> {
    const dictType = await this.dictTypeRepository.findOne({
      where: { id },
      relations: ['dictItems'],
    });

    if (!dictType) {
      throw new NotFoundException(`字典类型ID ${id} 不存在`);
    }

    return dictType;
  }

  async findByCode(code: string): Promise<DictType> {
    const dictType = await this.dictTypeRepository.findOne({
      where: { code },
      relations: ['dictItems'],
    });

    if (!dictType) {
      throw new NotFoundException(`字典类型编码 ${code} 不存在`);
    }

    return dictType;
  }

  async update(id: number, updateDictTypeDto: UpdateDictTypeDto): Promise<DictType> {
    const dictType = await this.findOne(id);

    // 如果更新编码，检查新编码是否已存在
    if (updateDictTypeDto.code && updateDictTypeDto.code !== dictType.code) {
      const existingType = await this.dictTypeRepository.findOne({
        where: { code: updateDictTypeDto.code },
      });

      if (existingType) {
        throw new ConflictException(`字典类型编码 ${updateDictTypeDto.code} 已存在`);
      }
    }

    Object.assign(dictType, updateDictTypeDto);
    return this.dictTypeRepository.save(dictType);
  }

  async remove(id: number): Promise<void> {
    const dictType = await this.findOne(id);
    await this.dictTypeRepository.remove(dictType);
  }
}