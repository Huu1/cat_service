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
      order: { isDefault: 'DESC', createdAt: 'DESC' },
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

  async update(userId: number, id: number, updateBookDto: UpdateBookDto) {
    const book = await this.findOne(userId, id);

    if (updateBookDto.isDefault) {
      // 如果设置为默认账本，需要取消其他账本的默认状态
      await this.bookRepository.update(
        { user: { id: userId }, isDefault: true },
        { isDefault: false },
      );
    }

    return this.bookRepository.save({
      ...book,
      ...updateBookDto,
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
}
