import { INestApplication, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import {
  STORE_REPOSITORY,
  THEME_REPOSITORY,
} from '../../common/inject.constant';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { ThemeService } from '../application/theme.service';
import { ReviewService } from '../../review/application/review.service';
import { TestThemeRepository } from '../infrastructure/testTheme.repository';
import { Store } from '../../store/domain/store.entity';
import { LocationEnum } from '../../store/domain/location.enum';
import { TestStoreRepository } from '../../store/infrastructure/testStore.repository';
import { Theme } from '../domain/theme.entity';
import { GetThemesListResponseDto } from '../application/dto/getThemesList.response.dto';
import { GetOneThemeResponseDto } from '../application/dto/getOneTheme.response.dto';

describe('ThemeService', () => {
  let app: INestApplication;
  let themeService: ThemeService;
  let themeRepository: TestThemeRepository;
  let storeRepository: TestStoreRepository;
  let reviewService: ReviewService;

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

    themeService = moduleRef.get<ThemeService>(ThemeService);
    themeRepository = moduleRef.get<TestThemeRepository>(THEME_REPOSITORY);
    storeRepository = moduleRef.get<TestStoreRepository>(STORE_REPOSITORY);
    reviewService = moduleRef.get<ReviewService>(ReviewService);

    app = moduleRef.createNestApplication();
    await app.init();
  });

  beforeEach(async () => {
    themeRepository.reset();
  });

  describe('getThemesByKeyword()', () => {
    beforeEach(async () => {
      themeRepository.reset();
    });

    it('키워드로 테마를 검색하여 목록을 반환한다.', async () => {
      const store = new Store({
        name: 'test store1 name',
        location: LocationEnum.KANGNAM,
        address: 'test store1 address',
        phoneNo: 'test store1 phoneNo',
        homepageUrl: 'test store1 homepageUrl',
      });
      await storeRepository.save(store);
      const theme1 = new Theme({
        name: 'test theme1 name',
        image: 'test theme1 image',
        plot: 'test theme1 plot',
        genre: 'test theme1 genre',
        time: 70,
        level: 1,
        price: 27000,
        note: 'test theme1 note',
        store: store,
      });
      await themeRepository.save(theme1);
      const theme2 = new Theme({
        name: 'test theme2 name',
        image: 'test theme2 image',
        plot: 'test theme2 plot',
        genre: 'test theme2 genre',
        time: 70,
        level: 1,
        price: 27000,
        note: 'test theme2 note',
        store: store,
      });
      await themeRepository.save(theme2);

      jest
        .spyOn(reviewService, 'countVisibleReviewsInTheme')
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(10);

      const result = await themeService.getThemesByKeyword('theme');

      const expected = [
        new GetThemesListResponseDto({ theme: theme1, reviewCount: 5 }),
        new GetThemesListResponseDto({ theme: theme2, reviewCount: 10 }),
      ];

      expect(result).toEqual(expected);
      expect(reviewService.countVisibleReviewsInTheme).toHaveBeenCalledWith(
        theme1.getId(),
      );
      expect(reviewService.countVisibleReviewsInTheme).toHaveBeenCalledWith(
        theme2.getId(),
      );
    });

    it('키워드로 검색된 테마가 없을 경우 빈 배열을 반환한다.', async () => {
      const result =
        await themeService.getThemesByKeyword('NonExistingKeyword');

      expect(result).toEqual([]);
    });
  });

  describe('getOneTheme()', () => {
    beforeEach(async () => {
      themeRepository.reset();
    });

    it('테마가 존재하지 않을 경우 NotFoundException 에러가 발생한다.', async () => {
      await expect(themeService.getOneTheme(2)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('테마가 존재할 경우 테마의 정보를 반환한다.', async () => {
      const store = new Store({
        name: 'test store1 name',
        location: LocationEnum.KANGNAM,
        address: 'test store1 address',
        phoneNo: 'test store1 phoneNo',
        homepageUrl: 'test store1 homepageUrl',
      });
      await storeRepository.save(store);

      const theme = new Theme({
        name: 'test theme name',
        image: 'test theme image',
        plot: 'test theme plot',
        genre: 'test theme genre',
        time: 70,
        level: 1,
        price: 27000,
        note: 'test theme note',
        store: store,
      });
      await themeRepository.save(theme);

      jest
        .spyOn(reviewService, 'countVisibleReviewsInTheme')
        .mockResolvedValue(0);
      jest
        .spyOn(reviewService, 'countVisibleReviewsInStore')
        .mockResolvedValue(0);
      jest
        .spyOn(reviewService, 'getThreeVisibleReviewsOfTheme')
        .mockResolvedValue([]);

      const result = await themeService.getOneTheme(theme.getId());

      const expected = new GetOneThemeResponseDto({
        theme,
        themeReviewCount: 0,
        storeReviewCount: 0,
        reviews: [],
      });

      expect(result).toEqual(expected);
      expect(reviewService.countVisibleReviewsInTheme).toHaveBeenCalledWith(
        theme.getId(),
      );
      expect(reviewService.countVisibleReviewsInStore).toHaveBeenCalledWith(
        store.getId(),
      );
      expect(reviewService.getThreeVisibleReviewsOfTheme).toHaveBeenCalledWith(
        theme.getId(),
      );
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
