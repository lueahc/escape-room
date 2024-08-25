import { INestApplication, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import {
  STORE_REPOSITORY,
  THEME_REPOSITORY,
} from '../../common/inject.constant';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { ReviewService } from '../../review/application/review.service';
import { TestThemeRepository } from '../../theme/infrastructure/testTheme.repository';
import { Store } from '../../store/domain/store.entity';
import { LocationEnum } from '../../store/domain/location.enum';
import { TestStoreRepository } from '../../store/infrastructure/testStore.repository';
import { StoreService } from '../application/store.service';
import { GetStoresListResponseDto } from '../application/dto/getStoresList.response.dto';
import { ThemeService } from '../../theme/application/theme.service';
import { GetOneStoreResponseDto } from '../application/dto/getOneStore.response.dto';

describe('StoreService', () => {
  let app: INestApplication;
  let storeService: StoreService;
  let themeRepository: TestThemeRepository;
  let storeRepository: TestStoreRepository;
  let reviewService: ReviewService;
  let themeService: ThemeService;

  beforeAll(async () => {
    initializeTransactionalContext();

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(THEME_REPOSITORY)
      .useClass(TestThemeRepository)
      .overrideProvider(STORE_REPOSITORY)
      .useClass(TestStoreRepository)
      .compile();

    storeService = moduleRef.get<StoreService>(StoreService);
    themeRepository = moduleRef.get<TestThemeRepository>(THEME_REPOSITORY);
    storeRepository = moduleRef.get<TestStoreRepository>(STORE_REPOSITORY);
    reviewService = moduleRef.get<ReviewService>(ReviewService);
    themeService = moduleRef.get<ThemeService>(ThemeService);

    app = moduleRef.createNestApplication();
    await app.init();
  });

  beforeEach(async () => {
    storeRepository.reset();
  });

  describe('getThemesByKeyword()', () => {
    beforeEach(async () => {
      storeRepository.reset();
    });

    it('키워드로 매장을 검색하여 목록을 반환한다.', async () => {
      const store = new Store({
        name: 'test store1 name',
        location: LocationEnum.KANGNAM,
        address: 'test store1 address',
        phoneNo: 'test store1 phoneNo',
        homepageUrl: 'test store1 homepageUrl',
      });
      await storeRepository.save(store);

      jest
        .spyOn(reviewService, 'countVisibleReviewsInStore')
        .mockResolvedValueOnce(5);

      const result = await storeService.getStoresByKeyword('store');

      const expected = [
        new GetStoresListResponseDto({ store, reviewCount: 5 }),
      ];

      expect(result).toEqual(expected);
      expect(reviewService.countVisibleReviewsInStore).toHaveBeenCalledWith(
        store.getId(),
      );
    });

    it('키워드로 검색된 매장이 없을 경우 빈 배열을 반환한다.', async () => {
      const result =
        await storeService.getStoresByKeyword('NonExistingKeyword');

      expect(result).toEqual([]);
    });
  });

  describe('getOneStore()', () => {
    beforeEach(async () => {
      storeRepository.reset();
    });

    it('매장이 존재하지 않을 경우 NotFoundException 에러가 발생한다.', async () => {
      await expect(storeService.getOneStore(2)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('매장이 존재할 경우 테마의 정보를 반환한다.', async () => {
      const store = new Store({
        name: 'test store1 name',
        location: LocationEnum.KANGNAM,
        address: 'test store1 address',
        phoneNo: 'test store1 phoneNo',
        homepageUrl: 'test store1 homepageUrl',
      });
      await storeRepository.save(store);

      jest
        .spyOn(reviewService, 'countVisibleReviewsInStore')
        .mockResolvedValue(0);
      jest.spyOn(themeService, 'getThemesByStoreId').mockResolvedValue([]);

      const result = await storeService.getOneStore(store.getId());

      const expected = new GetOneStoreResponseDto({
        store,
        reviewCount: 0,
        themes: [],
      });

      expect(result).toEqual(expected);
      expect(reviewService.countVisibleReviewsInStore).toHaveBeenCalledWith(
        store.getId(),
      );
      expect(themeService.getThemesByStoreId).toHaveBeenCalledWith(
        store.getId(),
      );
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
