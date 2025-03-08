import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { BusinessException } from '../../common/exceptions/business.exception';
import { BusinessError } from 'src/common/enums/business-error.enum';
import { QueryCategoryDto } from './dto/query-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const category = this.categoryRepository.create(createCategoryDto);
    return this.categoryRepository.save(category);
  }

  async findAll(query: QueryCategoryDto) {
    
    const queryBuilder = this.categoryRepository.createQueryBuilder('category');

    if (query.type) {
      queryBuilder.andWhere('category.type = :type', { type: query.type });
    }

    if (query.name) {
      queryBuilder.andWhere('LOWER(category.name) LIKE LOWER(:name)', { 
        name: `%${query.name}%` 
      });
    }

    return queryBuilder.orderBy('category.sort', 'ASC')
      .addOrderBy('category.createdAt', 'DESC')
      .getMany();
  }

  async findOne(id: number) {
    const category = await this.categoryRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new BusinessException(BusinessError.NOT_FOUND, '分类不存在');
    }

    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoryRepository.findOne({
      where: { id }
    });

    if (!category) {
      throw new BusinessException(BusinessError.NOT_FOUND, '分类不存在');
    }

    // 如果尝试修改类型，抛出错误（实际上通过 DTO 已经限制，这里是双重保险）
    if ('type' in updateCategoryDto) {
      throw new BusinessException(
        BusinessError.COMMON_ERROR,
        '不允许修改分类类型'
      );
    }

    await this.categoryRepository.update(id, updateCategoryDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['records']
    });

    if (!category) {
      throw new BusinessException(BusinessError.NOT_FOUND, '分类不存在');
    }

    if (category.records?.length > 0) {
      throw new BusinessException(BusinessError.COMMON_ERROR, '该分类下存在记录，无法删除');
    }

    return await this.categoryRepository.softRemove(category);
  }
}
