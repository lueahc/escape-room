import {
  BadRequestException,
  ConflictException,
  INestApplication,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { RECORD_REPOSITORY } from '../../common/inject.constant';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { ReviewService } from '../../review/application/review.service';
import { DataSource } from 'typeorm';
import { RecordRepository } from '../domain/record.repository';
import { TagPartyService } from '../application/tagParty.service';
import { Tag } from '../domain/tag.entity';

describe('TagPartyService', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let tagPartyService: TagPartyService;
  let reviewService: ReviewService;
  let recordRepository: RecordRepository;

  beforeAll(async () => {
    initializeTransactionalContext();
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();

    dataSource = moduleRef.get<DataSource>(DataSource);
    tagPartyService = moduleRef.get<TagPartyService>(TagPartyService);
    reviewService = moduleRef.get<ReviewService>(ReviewService);
    recordRepository = moduleRef.get<RecordRepository>(RECORD_REPOSITORY);
  });

  describe('setPartyUnique()', () => {
    it('Unique한 배열을 반환한다.', async () => {
      const party = [1, 2, 3, 3, 4, 1];
      const userId = 1;

      const result = tagPartyService['setPartyUnique'](party, userId);

      expect(result).toEqual([2, 3, 4]);
    });
  });

  describe('isArrayNotEmpty()', () => {
    it('배열에 값이 존재하면 true를 반환한다.', async () => {
      const arr = [1, 2, 3];
      const result = tagPartyService['isArrayNotEmpty'](arr);
      expect(result).toBe(true);
    });

    it('배열이 비어있거나 [""]일 경우 false를 반환한다.', async () => {
      const arr = [''];
      const result = tagPartyService['isArrayNotEmpty'](arr);
      expect(result).toBe(false);
    });
  });

  describe('isHeadCountLessThanPartyLength()', () => {
    it('일행의 수가 headCount보다 많으면 true를 반환한다.', async () => {
      const headCount = 2;
      const party = [1, 2, 3];
      const result = tagPartyService['isHeadCountLessThanPartyLength'](
        headCount,
        party,
      );
      expect(result).toBe(true);
    });

    it('일행의 수가 headCount보다 적거나 같으면 false를 반환한다.', async () => {
      const headCount = 3;
      const party = [1, 2];
      const result = tagPartyService['isHeadCountLessThanPartyLength'](
        headCount,
        party,
      );
      expect(result).toBe(false);
    });
  });

  describe('validatePartyNumber()', () => {
    it('isHeadCountLessThanPartyLength()가 true면 BadRequestException 에러가 발생한다.', async () => {
      const headCount = 2;
      const party = [1, 2, 3];
      expect(() =>
        tagPartyService['validatePartyNumber'](party, headCount),
      ).toThrow(BadRequestException);
    });

    it('isHeadCountLessThanPartyLength()가 false면 BadRequestException 에러가 발생하지 않는다.', async () => {
      const headCount = 3;
      const party = [1, 2];
      expect(() =>
        tagPartyService['validatePartyNumber'](party, headCount),
      ).not.toThrow(BadRequestException);
    });
  });

  //   describe('getOriginalTaggedMembers()', () => {
  //     it('', async () => {});
  //   });

  describe('getUntaggedMembers()', () => {
    it('newParty에 없는 originalParty 멤버들을 반환한다.', async () => {
      const newParty = [1, 2];
      const originalParty = [1, 2, 3, 4];
      const result = await tagPartyService['getUntaggedMembers'](
        newParty,
        originalParty,
      );
      expect(result).toEqual([3, 4]);
    });
  });

  describe('hasWrittenReviews()', () => {
    it('이미 작성한 리뷰가 있으면 ConflictException 에러가 발생한다.', async () => {
      const memberId = 1;
      const recordId = 1;
      jest.spyOn(reviewService, 'hasWrittenReview').mockResolvedValue(true);
      await expect(
        tagPartyService['hasWrittenReviews'](memberId, recordId),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('deleteTagWhenNoReviews()', () => {
    beforeEach(async () => {
      await dataSource.dropDatabase();
      await dataSource.synchronize();
    });

    it('삭제할 일행이 존재하지 않으면 NotFoundException 에러가 발생한다.', async () => {
      const memberId = 1;
      const recordId = 1;
      jest.spyOn(recordRepository, 'getOneTag').mockResolvedValue(null);
      await expect(
        tagPartyService['deleteTagWhenNoReviews'](memberId, recordId),
      ).rejects.toThrow(NotFoundException);
    });

    it('삭제할 일행이 존재하면 tag가 soft delete된다.', async () => {
      const memberId = 1;
      const recordId = 1;
      const tag = new Tag();
      jest.spyOn(recordRepository, 'getOneTag').mockResolvedValue(tag);
      jest
        .spyOn(recordRepository, 'softDeleteTag')
        .mockResolvedValue(undefined);
      await tagPartyService['deleteTagWhenNoReviews'](memberId, recordId);
      expect(recordRepository.softDeleteTag).toHaveBeenCalledWith(tag.getId());
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
