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
      queryBuilder.andWhere('category.name LIKE :name', { name: `%${query.name}%` });
    }

    return queryBuilder
      .orderBy('category.createdAt', 'DESC')
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
    const category = await this.findOne(id);
    return this.categoryRepository.save({
      ...category,
      ...updateCategoryDto,
    });
  }

  async remove(id: number) {
    const category = await this.findOne(id);
    return this.categoryRepository.remove(category);
  }
}
