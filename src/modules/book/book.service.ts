import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from './entities/book.entity';
import { CreateBookDto, UpdateBookDto } from './dto/book.dto';
import { BusinessException } from '../../common/exceptions/business.exception';
import { BusinessError } from '../../common/enums/business-error.enum';

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(Book)
    private bookRepository: Repository<Book>,
  ) {}

  async create(userId: number, createBookDto: CreateBookDto) {
    const existingDefault = await this.bookRepository.findOne({
      where: { user: { id: userId }, isDefault: true },
    });

    const book = this.bookRepository.create({
      ...createBookDto,
      user: { id: userId },
      isDefault: !existingDefault, // 如果没有默认账本，则设为默认
    });

    return this.bookRepository.save(book);
  }

  async findAll(userId: number) {
    return this.bookRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(userId: number, id: number) {
    const book = await this.bookRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!book) {
      throw new BusinessException(BusinessError.NOT_FOUND, '账本不存在');
    }

    return book;
  }

  async update(
    userId: number,
    bookId: number,
    updateBookDto: UpdateBookDto & { id?: number; isSystemDefault?: boolean },
  ) {
    const book = await this.findOne(userId, bookId);

    const { id, isSystemDefault, ...updateData } = updateBookDto;

    return this.bookRepository.save({
      ...book,
      ...updateData,
      isDefault: book.isDefault,
      isSystemDefault: book.isSystemDefault,
    });
  }

  async remove(userId: number, id: number) {
    const book = await this.findOne(userId, id);

    if (book.isDefault) {
      throw new BusinessException(
        BusinessError.DEFAULT_BOOK_DELETE,
        '不能删除默认账本',
      );
    }

    if (book.isSystemDefault) {
      throw new BusinessException(
        BusinessError.FORBIDDEN,
        '不能删除系统默认账本',
      );
    }

    if (!book) {
      throw new BusinessException(BusinessError.NOT_FOUND, '账本不存在');
    }

    if (book.records?.length > 0) {
      throw new BusinessException(
        BusinessError.COMMON_ERROR,
        '该账本下存在记录，无法删除',
      );
    }

    if (book.accounts?.length > 0) {
      throw new BusinessException(
        BusinessError.COMMON_ERROR,
        '该账本下存在账户，无法删除',
      );
    }

    return this.bookRepository.softRemove(book);
  }

  async setDefault(userId: number, id: number) {
    const book = await this.findOne(userId, id);

    // 先将所有账本设置为非默认
    await this.bookRepository.update(
      { user: { id: userId }, isDefault: true },
      { isDefault: false },
    );

    // 设置新的默认账本
    return this.bookRepository.save({
      ...book,
      isDefault: true,
    });
  }

  async getDefaultBook(userId: number) {
    const book = await this.bookRepository.findOne({
      where: {
        user: { id: userId },
        isDefault: true,
      },
      relations: ['user'],
    });

    if (!book) {
      throw new BusinessException(BusinessError.NOT_FOUND, '默认账本不存在');
    }

    return book;
  }
}
