import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BookService } from './book.service';
import { CreateBookDto, UpdateBookDto } from './dto/book.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('账本')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('books')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @ApiOperation({ summary: '创建账本' })
  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() createBookDto: CreateBookDto) {
    return this.bookService.create(user.userId, createBookDto);
  }

  @ApiOperation({ summary: '获取默认账本' })
  @Get('default')
  getDefaultBook(@CurrentUser() user: JwtPayload) {
    return this.bookService.getDefaultBook(user.userId);
  }

  @ApiOperation({ summary: '获取所有账本' })
  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.bookService.findAll(user.userId);
  }

  @ApiOperation({ summary: '获取指定账本' })
  @Get(':id')
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.bookService.findOne(user.userId, +id);
  }

  @ApiOperation({ summary: '更新账本' })
  @Put(':id')
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() updateBookDto: UpdateBookDto,
  ) {
    return this.bookService.update(user.userId, +id, updateBookDto);
  }

  @ApiOperation({ summary: '删除账本' })
  @Delete(':id')
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.bookService.remove(user.userId, +id);
  }
}