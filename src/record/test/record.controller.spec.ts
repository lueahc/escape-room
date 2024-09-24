import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { DataSource } from 'typeorm';
import { ThemeRepository } from '../../theme/domain/theme.repository';
import { StoreRepository } from '../../store/domain/store.repository';
import {
  STORE_REPOSITORY,
  THEME_REPOSITORY,
} from '../../common/inject.constant';
import { Store } from '../../store/domain/store.entity';
import { LocationEnum } from '../../store/domain/location.enum';
import { Theme } from '../../theme/domain/theme.entity';
import { RecordController } from '../presentation/record.controller';
import { RecordService } from '../application/record.service';
import { GetLogsResponseDto } from '../application/dto/getLogs.response.dto';
import { GetOneRecordResponseDto } from '../application/dto/getOneRecord.response.dto';
import { CreateAndUpdateRecordResponseDto } from '../application/dto/createAndUpdateRecord.response.dto';
import { Readable } from 'stream';
jest.mock('../application/record.service');

describe('RecordController', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let themeRepository: ThemeRepository;
  let storeRepository: StoreRepository;
  let recordController: RecordController;
  let recordService: RecordService;
  let accessToken: string;

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
    recordController = moduleRef.get<RecordController>(RecordController);
    recordService = moduleRef.get<RecordService>(RecordService);
  });

  beforeEach(async () => {
    await dataSource.dropDatabase();
    await dataSource.synchronize();

    const store = new Store({
      name: 'test store1 name',
      location: LocationEnum.KANGNAM,
      address: 'test store address',
      phoneNo: 'test store phoneNo',
      homepageUrl: 'test store homepageUrl',
    });
    await storeRepository.save(store);
    await themeRepository.save(
      new Theme({
        name: 'test theme name',
        image: 'test theme image',
        plot: 'test theme plot',
        genre: 'test theme genre',
        time: 70,
        level: 1,
        price: 27000,
        note: 'test theme note',
        store: store,
      }),
    );

    await request(app.getHttpServer()).post('/user/signUp').send({
      email: 'test1@test.com',
      password: 'test1234',
      nickname: 'tester1',
    });
    const loginResponse = await request(app.getHttpServer())
      .post('/user/signIn')
      .send({
        email: 'test1@test.com',
        password: 'test1234',
      });
    accessToken = loginResponse.body.accessToken;
  });

  describe('GET /record/log', () => {
    it('성공 시 상태코드 200으로 응답한다.', () => {
      request(app.getHttpServer())
        .get('/record/log')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });

    it('recordService.getLogs를 호출한다.', async () => {
      await request(app.getHttpServer())
        .post('/record')
        .set('Authorization', `Bearer ${accessToken}`)
        .field('themeId', 1)
        .field('isSuccess', 'true')
        .field('playDate', '2024-01-01')
        .field('headCount', 2);

      const userId = 1;
      const expectedResult: GetLogsResponseDto[] = [
        {
          id: 1,
          playDate: new Date('2024-01-01'),
          storeName: 'storeName',
          themeName: 'themeName',
          isSuccess: true,
        },
      ];
      jest.spyOn(recordService, 'getLogs').mockResolvedValue(expectedResult);
      const result = await recordController.getLogs(userId);
      expect(result).toEqual(expectedResult);
      expect(recordService.getLogs).toHaveBeenCalledWith(userId);
    });
  });

  describe('GET /record', () => {
    it('성공 시 상태코드 200으로 응답한다.', () => {
      request(app.getHttpServer())
        .get('/record')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });

    it('recordService.getAllRecordsAndReviews를 호출한다.', async () => {
      const userId = 1;
      const visibility = 'true';
      const expectedResult: GetOneRecordResponseDto[] = [
        {
          id: 1,
          writer: {
            id: 1,
            nickname: 'tester1',
          },
          theme: {
            id: 1,
            name: 'test theme name',
            store: {
              id: 1,
              name: 'test store1 name',
            },
          },
          isSuccess: true,
          playDate: new Date('2024-01-01'),
          headCount: 2,
          hintCount: 1,
          playTime: 1,
          image: '',
          note: '1',
          reviews: [],
        },
      ];
      jest
        .spyOn(recordService, 'getAllRecordsAndReviews')
        .mockResolvedValue(expectedResult);
      await recordController.getAllRecordsAndReviews(userId, visibility);
      expect(recordService.getAllRecordsAndReviews).toHaveBeenCalledWith(
        userId,
        visibility,
      );
    });
  });

  describe('GET /record/{recordId}', () => {
    it('성공 시 상태코드 200으로 응답한다.', async () => {
      await request(app.getHttpServer())
        .post('/record')
        .set('Authorization', `Bearer ${accessToken}`)
        .field('themeId', 1)
        .field('isSuccess', 'true')
        .field('playDate', '2024-01-01')
        .field('headCount', 2);

      request(app.getHttpServer())
        .get('/record/1')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });

    it('recordService.getTaggedUsers를 호출한다.', async () => {
      const userId = 1;
      const recordId = 1;
      const expectedResult = ['tester2'];
      jest
        .spyOn(recordService, 'getTaggedUsers')
        .mockResolvedValue(expectedResult);
      await recordController.getTaggedUsers(userId, recordId);
      expect(recordService.getTaggedUsers).toHaveBeenCalledWith(
        userId,
        recordId,
      );
    });
  });

  describe('POST /record', () => {
    it('성공 시 상태코드 201로 응답한다.', () => {
      request(app.getHttpServer())
        .post('/record')
        .set('Authorization', `Bearer ${accessToken}`)
        .field('themeId', 1)
        .field('isSuccess', 'true')
        .field('playDate', '2024-01-01')
        .field('headCount', 2)
        .expect(201);
    });

    it('themeId, playDate, isSuccess, headCount 중 하나라도 비어있으면 400 에러가 발생한다.', () => {
      request(app.getHttpServer())
        .post('/record')
        .set('Authorization', `Bearer ${accessToken}`)
        .field('isSuccess', 'true')
        .field('playDate', '2024-01-01')
        .field('headCount', 2)
        .expect(400);
    });

    it('recordService.createRecord를 호출한다.', async () => {
      await request(app.getHttpServer()).post('/user/signUp').send({
        email: 'test2@test.com',
        password: 'test1234',
        nickname: 'tester2',
      });
      const userId = 1;
      const file: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test-image.png',
        encoding: '7bit',
        mimetype: 'image/png',
        size: 1234,
        buffer: Buffer.from(''),
        stream: new Readable(),
        destination: 'uploads/',
        filename: 'test-image.png',
        path: 'uploads/test-image.png',
      };
      const createRecordRequestDto = {
        themeId: 1,
        playDate: new Date('2024-01-01'),
        isSuccessStr: 'true',
        headCount: 1,
        hintCount: 1,
        playTime: 1,
        note: '',
        party: [2],
        image: '',
        file: file,
      };
      const expectedResult: CreateAndUpdateRecordResponseDto = {
        id: 1,
        writer: {
          id: 1,
          nickname: 'tester1',
        },
        theme: {
          id: 1,
          name: 'test theme name',
          store: {
            id: 1,
            name: 'test store1 name',
          },
        },
        isSuccess: true,
        playDate: new Date('2024-01-01'),
        headCount: 1,
        hintCount: 1,
        playTime: 1,
        image: '',
        note: '',
      };
      jest
        .spyOn(recordService, 'createRecord')
        .mockResolvedValue(expectedResult);
      const result = await recordController.createRecord(
        userId,
        createRecordRequestDto,
        file,
      );
      expect(result).toEqual(expectedResult);
      expect(recordService.createRecord).toHaveBeenCalledWith(
        userId,
        createRecordRequestDto,
        file,
      );
    });
  });

  describe('PATCH /record/{recordId}', () => {
    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/record')
        .set('Authorization', `Bearer ${accessToken}`)
        .field('themeId', 1)
        .field('isSuccess', 'true')
        .field('playDate', '2024-01-01')
        .field('headCount', 2);
    });

    it('성공 시 상태코드 200으로 응답한다.', () => {
      request(app.getHttpServer())
        .patch('/record/1')
        .set('Authorization', `Bearer ${accessToken}`)
        .field('headCount', 3)
        .expect(200);
    });

    it('recordService.updateRecord를 호출한다.', async () => {
      await request(app.getHttpServer()).post('/user/signUp').send({
        email: 'test2@test.com',
        password: 'test1234',
        nickname: 'tester2',
      });
      const userId = 1;
      const recordId = 1;
      const file: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test-image.png',
        encoding: '7bit',
        mimetype: 'image/png',
        size: 1234,
        buffer: Buffer.from(''),
        stream: new Readable(),
        destination: 'uploads/',
        filename: 'test-image.png',
        path: 'uploads/test-image.png',
      };
      const updateRecordRequestDto = {
        playDate: new Date('2024-01-01'),
        isSuccessStr: 'true',
        headCount: 1,
        hintCount: 1,
        playTime: 1,
        note: '',
        party: [2],
        image: '',
        file: file,
      };
      const expectedResult: CreateAndUpdateRecordResponseDto = {
        id: 1,
        writer: {
          id: 1,
          nickname: 'tester1',
        },
        theme: {
          id: 1,
          name: 'test theme name',
          store: {
            id: 1,
            name: 'test store1 name',
          },
        },
        isSuccess: true,
        playDate: new Date('2024-01-01'),
        headCount: 1,
        hintCount: 1,
        playTime: 1,
        image: '',
        note: '',
      };
      jest
        .spyOn(recordService, 'updateRecord')
        .mockResolvedValue(expectedResult);
      const result = await recordController.updateRecord(
        userId,
        recordId,
        updateRecordRequestDto,
        file,
      );
      expect(result).toEqual(expectedResult);
      expect(recordService.updateRecord).toHaveBeenCalledWith(
        userId,
        recordId,
        updateRecordRequestDto,
        file,
      );
    });
  });

  describe('PATCH /record/{recordId}/visibility', () => {
    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/record')
        .set('Authorization', `Bearer ${accessToken}`)
        .field('themeId', 1)
        .field('isSuccess', 'true')
        .field('playDate', '2024-01-01')
        .field('headCount', 2);
    });

    it('성공 시 상태코드 204로 응답한다.', () => {
      request(app.getHttpServer())
        .patch('/record/1/visibility')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);
    });
    it('recordService.changeRecordVisibility를 호출한다.', async () => {
      const userId = 1;
      const recordId = 1;
      jest
        .spyOn(recordService, 'changeRecordVisibility')
        .mockImplementation(async () => {});
      await recordController.changeRecordVisibility(userId, recordId);
      expect(recordService.changeRecordVisibility).toHaveBeenCalledWith(
        userId,
        recordId,
      );
    });
  });

  describe('DELETE /record/{recordId}', () => {
    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/record')
        .set('Authorization', `Bearer ${accessToken}`)
        .field('themeId', 1)
        .field('isSuccess', 'true')
        .field('playDate', '2024-01-01')
        .field('headCount', 2);
    });

    it('성공 시 상태코드 204로 응답한다.', () => {
      request(app.getHttpServer())
        .delete('/record/1')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);
    });
    it('recordService.deleteRecord를 호출한다.', async () => {
      const userId = 1;
      const recordId = 1;
      jest
        .spyOn(recordService, 'deleteRecord')
        .mockImplementation(async () => {});
      await recordController.deleteRecord(userId, recordId);
      expect(recordService.deleteRecord).toHaveBeenCalledWith(userId, recordId);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
