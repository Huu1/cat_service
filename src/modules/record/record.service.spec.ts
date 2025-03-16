import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecordService } from './record.service';
import { Record, RecordType } from './entities/record.entity';
import { CreateRecordDto } from './dto/record.dto';

describe('RecordService', () => {
  let service: RecordService;
  let repository: Repository<Record>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
      getMany: jest.fn(),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecordService,
        {
          provide: getRepositoryToken(Record),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<RecordService>(RecordService);
    repository = module.get<Repository<Record>>(getRepositoryToken(Record));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new record', async () => {
      const createDto: CreateRecordDto = {
        type: RecordType.EXPENSE,
        amount: 100,
        categoryId: 1,
        accountId: 1,
        bookId: 1,
        recordDate: new Date(),
        note: '测试支出'
      };

      const expectedResult = {
        id: 1,
        ...createDto,
      };

      mockRepository.create.mockReturnValue(expectedResult);
      mockRepository.save.mockResolvedValue(expectedResult);

      const result = await service.create(1, createDto);
      expect(result).toEqual(expectedResult);
    });
  });

  // 其他测试用例...
});