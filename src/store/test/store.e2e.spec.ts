import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../app.module';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { ThemeRepository } from 'src/theme/domain/theme.repository';
import { StoreRepository } from '../domain/store.repository';
import {
  STORE_REPOSITORY,
  THEME_REPOSITORY,
} from '../../common/inject.constant';
import { createTestStoresAndThemes } from '../../common/test-setup';

describe('StoreController (E2E)', () => {
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

    dataSource = moduleRef.get<DataSource>(DataSource);
    themeRepository = moduleRef.get<ThemeRepository>(THEME_REPOSITORY);
    storeRepository = moduleRef.get<StoreRepository>(STORE_REPOSITORY);
  });

  beforeEach(async () => {
    await dataSource.dropDatabase();
    await dataSource.synchronize();
    await createTestStoresAndThemes(storeRepository, themeRepository);
  });

  describe('GET /store/search', () => {
    it('매장을 검색한다.', async () => {
      const response = await request(app.getHttpServer())
        .get('/store/search')
        .query({ keyword: 'store1' });

      expect(response.status).toBe(200);
      for (const store of response.body) {
        expect(store).toBeDefined();
      }
    });
  });

  describe('GET /store', () => {
    it('매장 목록을 조회한다.', async () => {
      const response = await request(app.getHttpServer()).get('/store');

      expect(response.status).toBe(200);
      for (const store of response.body) {
        expect(store).toBeDefined();
      }
    });

    it('매장 목록을 지역 별로 조회한다.', async () => {
      const response = await request(app.getHttpServer())
        .get('/store')
        .query({ location: '강남' });

      expect(response.status).toBe(200);
      for (const store of response.body) {
        expect(store).toBeDefined();
        expect(store.location).toBe('강남');
      }
    });
  });

  describe('GET /store/{storeId}', () => {
    it('특정 매장 정보를 조회한다.', async () => {
      const response = await request(app.getHttpServer()).get('/store/1');

      expect(response.status).toBe(200);
      for (const theme of response.body.themes) {
        expect(theme).toBeDefined();
      }
    });

    it('존재하지 않는 매장 정보를 조회하면 404 에러가 발생한다.', async () => {
      const response = await request(app.getHttpServer()).get('/store/5');

      expect(response.status).toBe(404);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
