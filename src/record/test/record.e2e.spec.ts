import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../app.module';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { StoreRepository } from '../../store/domain/store.repository';
import { ThemeRepository } from '../../theme/domain/theme.repository';
import {
  RECORD_REPOSITORY,
  STORE_REPOSITORY,
  THEME_REPOSITORY,
} from '../../common/inject.constant';
import { RecordRepository } from '../domain/record.repository';
import {
  setAppInstance,
  signUpUser,
  getAccessToken,
  createRecord,
  createTestStoresAndThemes,
} from '../../common/test-setup';

describe('RecordController (E2E)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let themeRepository: ThemeRepository;
  let storeRepository: StoreRepository;
  let recordRepository: RecordRepository;

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
    recordRepository = moduleRef.get<RecordRepository>(RECORD_REPOSITORY);
  });

  beforeEach(async () => {
    await dataSource.dropDatabase();
    await dataSource.synchronize();
    await createTestStoresAndThemes(storeRepository, themeRepository);
  });

  describe('GET /record/log', () => {
    it('사용자의 탈출일지를 조회한다.', async () => {
      await signUpUser('test@test.com', 'test1234', 'tester');
      const accessToken = await getAccessToken('test@test.com', 'test1234');
      await createRecord(accessToken);

      const response = await request(app.getHttpServer())
        .get('/record/log')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      for (const log of response.body) {
        expect(log.id).toBeDefined();
      }
    });
  });

  describe('GET /record', () => {
    it('공개 설정된 기록리뷰 목록을 조회한다.', async () => {
      await signUpUser('test@test.com', 'test1234', 'tester');
      const accessToken = await getAccessToken('test@test.com', 'test1234');
      await createRecord(accessToken);
      await createRecord(accessToken);

      const response = await request(app.getHttpServer())
        .get('/record')
        .set('Authorization', `Bearer ${accessToken}`)
        .query({ visibility: 'true' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });

    it('비공개 설정된 기록리뷰 목록을 조회한다.', async () => {
      await signUpUser('test@test.com', 'test1234', 'tester');
      const accessToken = await getAccessToken('test@test.com', 'test1234');
      await createRecord(accessToken);
      await createRecord(accessToken);
      await request(app.getHttpServer())
        .patch('/record/1/visibility')
        .set('Authorization', `Bearer ${accessToken}`);

      const response = await request(app.getHttpServer())
        .get('/record')
        .set('Authorization', `Bearer ${accessToken}`)
        .query({ visibility: 'false' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
    });

    it('기록리뷰 목록 전체 조회한다.', async () => {
      await signUpUser('test@test.com', 'test1234', 'tester');
      const accessToken = await getAccessToken('test@test.com', 'test1234');
      await createRecord(accessToken);
      await createRecord(accessToken);
      await request(app.getHttpServer())
        .patch('/record/1/visibility')
        .set('Authorization', `Bearer ${accessToken}`);

      const response = await request(app.getHttpServer())
        .get('/record')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });
  });

  describe('GET /record/{recordId}', () => {
    it('특정 기록을 조회한다.', async () => {
      await signUpUser('test@test.com', 'test1234', 'tester1');
      const accessToken = await getAccessToken('test@test.com', 'test1234');
      await createRecord(accessToken);

      const response = await request(app.getHttpServer())
        .get('/record/1')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBeDefined();
    });
  });

  describe('GET /record/{recordId}/tag', () => {
    it('특정한 기록에 태그된 사용자를 조회한다.', async () => {
      await signUpUser('test1@test.com', 'test1234', 'tester1');
      const taggedUser = await signUpUser(
        'test2@test.com',
        'test1234',
        'tester2',
      );
      const taggedUserId = taggedUser.body.userId;
      const taggedUserNickname = taggedUser.body.userNickname;
      const accessToken = await getAccessToken('test1@test.com', 'test1234');
      await request(app.getHttpServer())
        .post('/record')
        .set('Authorization', `Bearer ${accessToken}`)
        .field('themeId', 1)
        .field('isSuccess', 'true')
        .field('playDate', '2024-01-01')
        .field('headCount', 4)
        .field('party[0]', taggedUserId);

      const response = await request(app.getHttpServer())
        .get('/record/1/tag')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body[0]).toBe(taggedUserNickname);
    });
  });

  describe('POST /record', () => {
    it('기록을 생성한다.', async () => {
      await signUpUser('test@test.com', 'test1234', 'tester');
      const accessToken = await getAccessToken('test@test.com', 'test1234');
      const response = await createRecord(accessToken);

      expect(response.status).toBe(201);
      const record = await recordRepository.findOneById(1);
      expect(record).toBeDefined();
    });
  });

  describe('PATCH /record/{recordId}', () => {
    it('기록의 내용을 수정한다.', async () => {
      await signUpUser('test@test.com', 'test1234', 'tester');
      const accessToken = await getAccessToken('test@test.com', 'test1234');
      await createRecord(accessToken);

      const response = await request(app.getHttpServer())
        .patch('/record/1')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          headCount: 3,
        });

      expect(response.status).toBe(200);
      const record = await recordRepository.findOneById(1);
      expect(record?.getHeadCount()).toBe(3);
    });
  });

  describe('PATCH /record/{recordId}/visibility', () => {
    it('기록의 공개여부를 수정한다.', async () => {
      await signUpUser('test@test.com', 'test1234', 'tester');
      const accessToken = await getAccessToken('test@test.com', 'test1234');
      await createRecord(accessToken);

      const response = await request(app.getHttpServer())
        .patch('/record/1/visibility')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(204);
      const tag = await recordRepository.getOneTag(1, 1);
      expect(tag?.getVisibility()).toBe(false);
    });
  });

  describe('DELETE /record/{recordId}', () => {
    it('기록을 삭제한다.', async () => {
      await signUpUser('test@test.com', 'test1234', 'tester');
      const accessToken = await getAccessToken('test@test.com', 'test1234');
      await createRecord(accessToken);

      const response = await request(app.getHttpServer())
        .delete('/record/1')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(204);
      const record = await recordRepository.findOneById(1);
      expect(record).toBeNull();
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
