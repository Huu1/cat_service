import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from './entities/account.entity';
import { CreateAccountDto, UpdateAccountDto } from './dto/account.dto';
import { BusinessException } from '../../common/exceptions/business.exception';
import { BusinessError } from 'src/common/enums/business-error.enum';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
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
    const account = await this.findOne(userId, id);
    if (account.isDefault) {
      throw new BusinessException(BusinessError.FORBIDDEN, '不能删除默认账户');
    }
    return this.accountRepository.remove(account);
  }
}
