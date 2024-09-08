import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../app.module';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { ThemeRepository } from '../domain/theme.repository';
import { StoreRepository } from '../../store/domain/store.repository';
import {
  STORE_REPOSITORY,
  THEME_REPOSITORY,
} from '../../common/inject.constant';
import {
  setAppInstance,
  signUpUser,
  getAccessToken,
  createTestStoresAndThemes,
  createRecord,
  createReview,
} from '../../common/test-setup';

describe('ThemeController (E2E)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let themeRepository: ThemeRepository;
  let storeRepository: StoreRepository;

  beforeAll(async () => {
    initializeTransactionalContext();
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
    setAppInstance(app);

    dataSource = moduleRef.get<DataSource>(DataSource);
    themeRepository = moduleRef.get<ThemeRepository>(THEME_REPOSITORY);
    storeRepository = moduleRef.get<StoreRepository>(STORE_REPOSITORY);
  });

  beforeEach(async () => {
    await dataSource.dropDatabase();
    await dataSource.synchronize();
    await createTestStoresAndThemes(storeRepository, themeRepository);
  });

  describe('GET /theme/search', () => {
    it('테마를 검색한다.', async () => {
      const response = await request(app.getHttpServer())
        .get('/theme/search')
        .query({ keyword: 'theme1' });

      expect(response.status).toBe(200);
      for (const theme of response.body) {
        expect(theme).toBeDefined();
      }
    });
  });

  describe('GET /theme', () => {
    it('테마 목록을 조회한다.', async () => {
      const response = await request(app.getHttpServer()).get('/theme');

      expect(response.status).toBe(200);
      for (const theme of response.body) {
        expect(theme).toBeDefined();
      }
    });

    it('테마 목록을 지역 별로 조회한다.', async () => {
      const response = await request(app.getHttpServer())
        .get('/theme')
        .query({ location: '강남' });

      expect(response.status).toBe(200);
      for (const theme of response.body) {
        expect(theme).toBeDefined();
        expect(theme.storeLocation).toBe('강남');
      }
    });
  });

  describe('GET /theme/{themeId}', () => {
    it('특정 테마 정보를 조회한다.', async () => {
      const response = await request(app.getHttpServer()).get('/theme/1');
      expect(response.status).toBe(200);
      expect(response.body.id).toBeDefined();
    });

    it('존재하지 않는 테마 정보를 조회하면 404 에러가 발생한다.', async () => {
      const response = await request(app.getHttpServer()).get('/theme/5');
      expect(response.status).toBe(404);
    });
  });

  describe('GET /theme/{themeId}/review', () => {
    it('특정 테마의 리뷰 목록을 조회한다.', async () => {
      await signUpUser('test@test.com', 'test1234', 'tester');
      const accessToken = await getAccessToken('test@test.com', 'test1234');
      await createRecord(accessToken);
      await createReview(accessToken);

      const response = await request(app.getHttpServer()).get(
        '/theme/1/review',
      );

      expect(response.status).toBe(200);
      for (const review of response.body) {
        expect(review.id).toBeDefined();
      }
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
