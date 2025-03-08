import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from './entities/account.entity';
import { CreateAccountDto, UpdateAccountDto } from './dto/account.dto';
import { BusinessException } from '../../common/exceptions/business.exception';
import { BusinessError } from 'src/common/enums/business-error.enum';
import { AccountTemplateService } from '../account-template/account-template.service';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    private accountTemplateService: AccountTemplateService,
  ) {}

  async create(userId: number, createAccountDto: CreateAccountDto) {
    const { bookId, ...accountData } = createAccountDto;

    if (accountData.isDefault) {
      // 如果设置为默认账户，需要取消同一账本中其他账户的默认状态
      await this.accountRepository.update(
        { book: { id: bookId }, user: { id: userId }, isDefault: true },
        { isDefault: false },
      );
    }

    const account = this.accountRepository.create({
      ...accountData,
      user: { id: userId },
      book: { id: bookId },
    });

    return this.accountRepository.save(account);
  }

  async findAll(userId: number) {
    const where: any = { user: { id: userId } };

    return this.accountRepository.find({
      where,
      order: {
        isDefault: 'DESC',
        createdAt: 'DESC',
      },
    });
  }

  async findOne(userId: number, id: number) {
    const account = await this.accountRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!account) {
      throw new BusinessException(BusinessError.NOT_FOUND, '账户不存在');
    }

    return account;
  }

  async update(userId: number, id: number, updateAccountDto: UpdateAccountDto) {
    const account = await this.findOne(userId, id);
    const { bookId, ...updateData } = updateAccountDto;

    if (updateData.isDefault) {
      await this.accountRepository.update(
        {
          book: { id: bookId || account.book.id },
          user: { id: userId },
          isDefault: true,
        },
        { isDefault: false },
      );
    }

    return this.accountRepository.save({
      ...account,
      ...updateData,
      book: bookId ? { id: bookId } : account.book,
    });
  }

  async remove(userId: number, id: number) {
    const account = await this.accountRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['records']
    });

    if (!account) {
      throw new BusinessException(BusinessError.NOT_FOUND, '账户不存在');
    }

    if (account.records?.length > 0) {
      throw new BusinessException(BusinessError.COMMON_ERROR, '该账户下存在记录，无法删除');
    }

    await this.accountRepository.softRemove(account);
    return { message: '删除成功' };
  }

  // 新增方法：从模板创建账户
  async createFromTemplate(userId: number, bookId: number, templateId: number, name?: string) {
    // 获取模板
    const template = await this.accountTemplateService.copyTemplate(templateId);
    
    // 创建新账户
    const account = this.accountRepository.create({
      name: name || template.name,
      icon: template.icon,
      balance: 0, // 新账户余额默认为0
      type: template.type,
      user: { id: userId },
      book: { id: bookId }
    });
    
    return this.accountRepository.save(account);
  }
}
