import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountTemplate } from './entities/account-template.entity';
import { CreateAccountTemplateDto, UpdateAccountTemplateDto } from './dto/account-template.dto';
import { AccountType } from '../account/enums/account-type.enum';
import { BusinessException } from '../../common/exceptions/business.exception';
import { BusinessError } from 'src/common/enums/business-error.enum';

@Injectable()
export class AccountTemplateService {
  constructor(
    @InjectRepository(AccountTemplate)
    private accountTemplateRepository: Repository<AccountTemplate>,
  ) {}

  async create(createDto: CreateAccountTemplateDto) {
    const template = this.accountTemplateRepository.create(createDto);
    return this.accountTemplateRepository.save(template);
  }

  async findAll(query: { type?: AccountType; name?: string }) {
    const queryBuilder = this.accountTemplateRepository.createQueryBuilder('template');

    if (query.type) {
      queryBuilder.andWhere('template.type = :type', { type: query.type });
    }

    if (query.name) {
      queryBuilder.andWhere('LOWER(template.name) LIKE LOWER(:name)', { 
        name: `%${query.name}%` 
      });
    }

    return queryBuilder
      .orderBy('template.sort', 'ASC')
      .addOrderBy('template.createdAt', 'DESC')
      .getMany();
  }

  async findOne(id: number) {
    const template = await this.accountTemplateRepository.findOne({
      where: { id }
    });
    
    if (!template) {
      throw new BusinessException(BusinessError.NOT_FOUND, '账户模板不存在');
    }
    
    return template;
  }

  // 新增方法：复制模板
  async copyTemplate(id: number) {
    const template = await this.findOne(id);
    return template;
  }

  async update(id: number, updateDto: UpdateAccountTemplateDto) {
    const template = await this.accountTemplateRepository.findOne({
      where: { id }
    });

    if (!template) {
      throw new BusinessException(BusinessError.NOT_FOUND, '账户模板不存在');
    }

    await this.accountTemplateRepository.update(id, updateDto);
    return this.accountTemplateRepository.findOne({
      where: { id }
    });
  }

  async remove(id: number) {
    const template = await this.accountTemplateRepository.findOne({
      where: { id },
      relations: ['accounts']
    });

    if (!template) {
      throw new BusinessException(BusinessError.NOT_FOUND, '账户模板不存在');
    }


    await this.accountTemplateRepository.softRemove(template);
    return { message: '删除成功' };
  }
}