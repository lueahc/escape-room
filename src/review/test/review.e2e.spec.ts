import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../app.module';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { ThemeRepository } from '../../theme/domain/theme.repository';
import { StoreRepository } from '../../store/domain/store.repository';
import {
  REVIEW_REPOSITORY,
  STORE_REPOSITORY,
  THEME_REPOSITORY,
} from '../../common/inject.constant';
import { ReviewRepository } from '../domain/review.repository';
import {
  setAppInstance,
  signUpUser,
  getAccessToken,
  createRecord,
  createReview,
  createTestStoresAndThemes,
} from '../../common/test-setup';

describe('ReviewController (E2E)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let themeRepository: ThemeRepository;
  let storeRepository: StoreRepository;
  let reviewRepository: ReviewRepository;

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
    reviewRepository = moduleRef.get<ReviewRepository>(REVIEW_REPOSITORY);
  });

  beforeEach(async () => {
    await dataSource.dropDatabase();
    await dataSource.synchronize();
    await createTestStoresAndThemes(storeRepository, themeRepository);
  });

  describe('POST /review', () => {
    it('리뷰를 생성한다.', async () => {
      await signUpUser('test@test.com', 'test1234', 'tester');
      const accessToken = await getAccessToken('test@test.com', 'test1234');
      await createRecord(accessToken);

      const response = await createReview(accessToken);

      expect(response.status).toBe(201);
      const review = await reviewRepository.findOneById(1);
      expect(review).toBeDefined();
    });
  });

  describe('PATCH /review/{reviewId}', () => {
    it('리뷰를 수정한다.', async () => {
      await signUpUser('test@test.com', 'test1234', 'tester');
      const accessToken = await getAccessToken('test@test.com', 'test1234');
      await createRecord(accessToken);
      await createReview(accessToken);

      const response = await request(app.getHttpServer())
        .patch('/review/1')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          activity: 2,
        });

      expect(response.status).toBe(200);
      const review = await reviewRepository.findOneById(1);
      expect(review?.getActivity()).toBe(2);
    });
  });

  describe('DELETE /review/{reviewId}', () => {
    it('리뷰를 삭제한다.', async () => {
      await signUpUser('test@test.com', 'test1234', 'tester');
      const accessToken = await getAccessToken('test@test.com', 'test1234');
      await createRecord(accessToken);
      await createReview(accessToken);

      const response = await request(app.getHttpServer())
        .delete('/review/1')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(204);
      const review = await reviewRepository.findOneById(1);
      expect(review).toBeNull();
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
