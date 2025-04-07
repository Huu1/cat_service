import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DictItem } from '../entities/dict-item.entity';
import { DictType } from '../entities/dict-type.entity';
import { CreateDictItemDto } from '../dto/create-dict-item.dto';
import { UpdateDictItemDto } from '../dto/update-dict-item.dto';

@Injectable()
export class DictItemService {
  constructor(
    @InjectRepository(DictItem)
    private dictItemRepository: Repository<DictItem>,
    @InjectRepository(DictType)
    private dictTypeRepository: Repository<DictType>,
  ) {}

  async create(createDictItemDto: CreateDictItemDto): Promise<DictItem> {
    // 检查字典类型是否存在
    const dictType = await this.dictTypeRepository.findOne({
      where: { id: createDictItemDto.dictTypeId },
    });

    if (!dictType) {
      throw new NotFoundException(`字典类型ID ${createDictItemDto.dictTypeId} 不存在`);
    }

    const dictItem = this.dictItemRepository.create(createDictItemDto);
    return this.dictItemRepository.save(dictItem);
  }

  async findAll(): Promise<DictItem[]> {
    return this.dictItemRepository.find({
      relations: ['dictType'],
      order: { sort: 'ASC', createdAt: 'DESC' },
    });
  }

  async findByDictTypeId(dictTypeId: number): Promise<DictItem[]> {
    return this.dictItemRepository.find({
      where: { dictTypeId },
      order: { sort: 'ASC', createdAt: 'DESC' },
    });
  }

  async findByDictTypeCode(code: string): Promise<DictItem[]> {
    const dictType = await this.dictTypeRepository.findOne({
      where: { code },
    });

    if (!dictType) {
      throw new NotFoundException(`字典类型编码 ${code} 不存在`);
    }

    return this.dictItemRepository.find({
      where: { dictTypeId: dictType.id },
      order: { sort: 'ASC', createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<DictItem> {
    const dictItem = await this.dictItemRepository.findOne({
      where: { id },
      relations: ['dictType'],
    });

    if (!dictItem) {
      throw new NotFoundException(`字典项ID ${id} 不存在`);
    }

    return dictItem;
  }

  async update(id: number, updateDictItemDto: UpdateDictItemDto): Promise<DictItem> {
    const dictItem = await this.findOne(id);

    // 如果更新字典类型ID，检查新字典类型是否存在
    if (updateDictItemDto.dictTypeId && updateDictItemDto.dictTypeId !== dictItem.dictTypeId) {
      const dictType = await this.dictTypeRepository.findOne({
        where: { id: updateDictItemDto.dictTypeId },
      });

      if (!dictType) {
        throw new NotFoundException(`字典类型ID ${updateDictItemDto.dictTypeId} 不存在`);
      }
    }

    Object.assign(dictItem, updateDictItemDto);
    return this.dictItemRepository.save(dictItem);
  }

  async remove(id: number): Promise<void> {
    const dictItem = await this.findOne(id);
    await this.dictItemRepository.remove(dictItem);
  }
}