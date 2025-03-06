import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountTemplate } from './entities/account-template.entity';
import { CreateAccountTemplateDto, UpdateAccountTemplateDto } from './dto/account-template.dto';
import { AccountType } from '../account/entities/account.entity';
import { BusinessException } from '../../common/exceptions/business.exception';
import { BusinessError } from 'src/common/enums/business-error.enum';

@Injectable()
export class AccountTemplateService {
  constructor(
    @InjectRepository(AccountTemplate)
    private templateRepository: Repository<AccountTemplate>,
  ) {}

  async create(createDto: CreateAccountTemplateDto) {
    const template = this.templateRepository.create(createDto);
    return this.templateRepository.save(template);
  }

  async findAll(type?: AccountType) {
    const where = type ? { type } : {};
    return this.templateRepository.find({
      where,
      order: {
        sort: 'ASC',
        createdAt: 'DESC'
      }
    });
  }

  async findOne(id: number) {
    const template = await this.templateRepository.findOne({
      where: { id }
    });

    if (!template) {
      throw new BusinessException(BusinessError.NOT_FOUND, '模板不存在');
    }

    return template;
  }

  async update(id: number, updateDto: UpdateAccountTemplateDto) {
    const template = await this.findOne(id);
    return this.templateRepository.save({
      ...template,
      ...updateDto
    });
  }

  async remove(id: number) {
    const template = await this.findOne(id);
    return this.templateRepository.remove(template);
  }
}