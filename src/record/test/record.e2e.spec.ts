import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({
    path: path.resolve('.local.env')
});

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from "@nestjs/common";
import { AppModule } from "../../app.module";
import * as request from 'supertest';
import { DataSource, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

import { initializeTransactionalContext } from 'typeorm-transactional';
import { RecordService } from '../record.service';
import { Theme } from '../../theme/theme.entity';
import { Store } from '../../store/store.entity';
import { LocationEnum } from '../../store/location.enum';

describe('RecordController (E2E)', () => {
    let app: INestApplication;
    let recordService: RecordService;
    let dataSource: DataSource;
    let accessToken: string;
    let storeRepository: Repository<Store>;
    let themeRepository: Repository<Theme>;

    beforeAll(async () => {
        initializeTransactionalContext();

        const moduleRef: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        dataSource = moduleRef.get<DataSource>(DataSource);

        recordService = moduleRef.get<RecordService>(RecordService);
        const storeRepositoryToken = getRepositoryToken(Store);
        storeRepository = moduleRef.get<Repository<Store>>(storeRepositoryToken);
        const themeRepositoryToken = getRepositoryToken(Theme);
        themeRepository = moduleRef.get<Repository<Theme>>(themeRepositoryToken);

        app = moduleRef.createNestApplication();
        await app.init();
    });

    beforeEach(async () => {
        await dataSource.dropDatabase();
        await dataSource.synchronize();

        await request(app.getHttpServer())
            .post('/user/signUp')
            .send({
                email: "test1@test.com",
                password: "test1234",
                nickname: "tester1"
            });

        const loginResponse = await request(app.getHttpServer())
            .post('/user/signIn')
            .send({
                email: "test1@test.com",
                password: "test1234",
            });
        accessToken = loginResponse.body.accessToken;

        const store = storeRepository.create({
            name: "test store name",
            location: LocationEnum.KANGNAM,
            address: "test store address",
            phoneNo: "test store phoneNo",
            homepageUrl: "test store homepageUrl"
        });
        await storeRepository.save(store);

        await themeRepository.save({
            name: "test theme name",
            image: "test theme image",
            plot: "test theme plot",
            genre: "test theme genre",
            time: 70,
            level: 1,
            price: 27000,
            note: "test theme note",
            store
        });

        await request(app.getHttpServer())
            .post('/record')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                themeId: 1,
                isSuccess: true,
                playDate: "2024-01-01",
                headCount: 4,
            });
    });

    describe('GET /record/log', () => {
        it('사용자의 탈출일지를 조회한다.', async () => {
            const response = await request(app.getHttpServer())
                .get('/record/log')
                .set('Authorization', `Bearer ${accessToken}`);

            expect(response.status).toBe(200);
            if (Array.isArray(response.body) && response.body.length !== 0) {
                for (const record of response.body) {
                    expect(record).toHaveProperty('id');
                    expect(record).toHaveProperty('playDate');
                    expect(record).toHaveProperty('storeName');
                    expect(record).toHaveProperty('themeName');
                    expect(record).toHaveProperty('isSuccess');
                }
            }
        });
    });

    describe('GET /record', () => {
        it('기록과 리뷰 목록을 조회한다.', async () => {
            await request(app.getHttpServer())
                .post('/review')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    recordId: 1,
                    content: "test review content",
                    activity: 5
                });

            const response = await request(app.getHttpServer())
                .get('/record')
                .set('Authorization', `Bearer ${accessToken}`);

            expect(response.status).toBe(200);
            if (Array.isArray(response.body) && response.body.length !== 0) {
                for (const record of response.body) {
                    expect(record).toHaveProperty('id');
                    expect(record).toHaveProperty('writer');
                    expect(record.writer).toHaveProperty('id');
                    expect(record.writer).toHaveProperty('nickname');
                    expect(record).toHaveProperty('theme');
                    expect(record.theme).toHaveProperty('id');
                    expect(record.theme).toHaveProperty('name');
                    expect(record.theme).toHaveProperty('store');
                    expect(record.theme.store).toHaveProperty('id');
                    expect(record.theme.store).toHaveProperty('name');
                    expect(record).toHaveProperty('playDate');
                    expect(record).toHaveProperty('isSuccess');
                    expect(record).toHaveProperty('headCount');

                    if (Array.isArray(record.reviews) && record.reviews.length !== 0) {
                        for (const review of record.reviews) {
                            expect(review).toHaveProperty('id');
                            expect(review).toHaveProperty('writer');
                            expect(review.writer).toHaveProperty('id');
                            expect(review.writer).toHaveProperty('nickname');
                            expect(review).toHaveProperty('rate');
                        }
                    }
                }
            }
        });
    });

    describe('GET /record/{recordId}', () => {
        it('특정한 기록리뷰를 조회한다.', async () => {
            await request(app.getHttpServer())
                .post('/review')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    recordId: 1,
                    content: "test review content",
                    rate: 5,
                });

            const response = await request(app.getHttpServer())
                .get('/record/1')
                .set('Authorization', `Bearer ${accessToken}`)

            const record = response.body;
            expect(response.status).toBe(200);
            expect(record).toHaveProperty('id');
            expect(record).toHaveProperty('writer');
            expect(record.writer).toHaveProperty('id');
            expect(record.writer).toHaveProperty('nickname');
            expect(record).toHaveProperty('theme');
            expect(record.theme).toHaveProperty('id');
            expect(record.theme).toHaveProperty('name');
            expect(record.theme).toHaveProperty('store');
            expect(record.theme.store).toHaveProperty('id');
            expect(record.theme.store).toHaveProperty('name');
            expect(record).toHaveProperty('playDate');
            expect(record).toHaveProperty('isSuccess');
            expect(record).toHaveProperty('headCount');

            if (Array.isArray(record.reviews) && record.reviews.length !== 0) {
                for (const review of record.reviews) {
                    expect(review).toHaveProperty('id');
                    expect(review).toHaveProperty('writer');
                    expect(review.writer).toHaveProperty('id');
                    expect(review.writer).toHaveProperty('nickname');
                    expect(review).toHaveProperty('rate');
                }
            }
        });

        it('존재하지 않은 기록을 조회하면 404 에러가 발생한다.', async () => {
            const response = await request(app.getHttpServer())
                .get('/record/2')
                .set('Authorization', `Bearer ${accessToken}`)

            expect(response.status).toBe(404);
        })
    });

    describe('GET /record/{recordId}/tag', () => {
        it('특정한 기록에 태그된 사용자를 조회한다.', async () => {
            await request(app.getHttpServer())
                .post('/user/signUp')
                .send({
                    email: "test2@test.com",
                    password: "test1234",
                    nickname: "tester2"
                });

            await request(app.getHttpServer())
                .patch('/record/1')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    party: [2]
                });

            const response = await request(app.getHttpServer())
                .get('/record/1/tag')
                .set('Authorization', `Bearer ${accessToken}`)

            expect(response.status).toBe(200);
            if (Array.isArray(response.body)) {
                for (const tag of response.body) {
                    expect(typeof tag).toBe('string');
                }
            }
        });
    });

    describe('POST /record', () => {
        it('기록을 생성한다.', async () => {
            const response = await request(app.getHttpServer())
                .post('/record')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    themeId: 1,
                    isSuccess: true,
                    playDate: "2024-01-01",
                    headCount: 4,
                });

            expect(response.status).toBe(201);
            const record = response.body;
            expect(record).toHaveProperty('id');
            expect(record).toHaveProperty('writer');
            expect(record.writer).toHaveProperty('id');
            expect(record.writer).toHaveProperty('nickname');
            expect(record).toHaveProperty('theme');
            expect(record.theme).toHaveProperty('id');
            expect(record.theme).toHaveProperty('name');
            expect(record.theme).toHaveProperty('store');
            expect(record.theme.store).toHaveProperty('id');
            expect(record.theme.store).toHaveProperty('name');
            expect(record).toHaveProperty('isSuccess');
            expect(record).toHaveProperty('playDate');
            expect(record).toHaveProperty('headCount');
            const createdRecord = await recordService.getRecordById(1);
            expect(createdRecord).toBeDefined();
        });

        it('존재하지 않는 사용자가 요청하면 404 에러가 발생한다.', async () => { });

        it('존재하지 않는 테마에 기록을 생성하면 404 에러가 발생한다.', async () => {
            const response = await request(app.getHttpServer())
                .post('/record')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    themeId: 2,
                    isSuccess: true,
                    playDate: "2024-01-01",
                    headCount: 4,
                });

            expect(response.status).toBe(404);
        });

        it('일행으로 추가할 사용자 수가 인원 수보다 많으면 400 에러가 발생한다.', async () => {
            await request(app.getHttpServer())
                .post('/user/signUp')
                .send({
                    email: "test2@test.com",
                    password: "test1234",
                    nickname: "tester2"
                });

            const response = await request(app.getHttpServer())
                .post('/record')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    themeId: 1,
                    isSuccess: true,
                    playDate: "2024-01-01",
                    headCount: 1,
                    party: [2]
                });

            expect(response.status).toBe(400);
        });

        it('추가하려는 일행이 존재하지 않는 사용자면 404 에러가 발생한다.', async () => {
            const response = await request(app.getHttpServer())
                .post('/record')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    themeId: 1,
                    isSuccess: true,
                    playDate: "2024-01-01",
                    headCount: 4,
                    party: [3]
                });

            expect(response.status).toBe(404);
        });
    });

    describe('PATCH /record/{recordId}', () => {
        it('기록의 내용을 수정한다.', async () => {
            const response = await request(app.getHttpServer())
                .patch('/record/1')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    headCount: 3,
                });

            expect(response.status).toBe(200);
            const record = response.body;
            expect(record).toHaveProperty('id');
            expect(record).toHaveProperty('writer');
            expect(record.writer).toHaveProperty('id');
            expect(record.writer).toHaveProperty('nickname');
            expect(record).toHaveProperty('theme');
            expect(record.theme).toHaveProperty('id');
            expect(record.theme).toHaveProperty('name');
            expect(record.theme).toHaveProperty('store');
            expect(record.theme.store).toHaveProperty('id');
            expect(record.theme.store).toHaveProperty('name');
            expect(record).toHaveProperty('isSuccess');
            expect(record).toHaveProperty('playDate');
            expect(record).toHaveProperty('headCount');
        });

        it('존재하지 않는 기록을 수정하면 404 에러가 발생한다.', async () => {
            const response = await request(app.getHttpServer())
                .patch('/record/2')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    headCount: 3,
                });

            expect(response.status).toBe(404);
        });

        it('존재하지 않는 사용자가 요청하면 404 에러가 발생한다.', async () => { });

        it('기록을 등록한 사용자가 아닌 사용자가 요청하면 403 에러가 발생한다.', async () => {
            await request(app.getHttpServer())
                .post('/user/signUp')
                .send({
                    email: "test2@test.com",
                    password: "test1234",
                    nickname: "tester2"
                });

            const loginResponse = await request(app.getHttpServer())
                .post('/user/signIn')
                .send({
                    email: "test2@test.com",
                    password: "test1234",
                });
            accessToken = loginResponse.body.accessToken;

            const response = await request(app.getHttpServer())
                .patch('/record/1')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    headCount: 3,
                });

            expect(response.status).toBe(403);
        });

        it('일행으로 추가할 사용자 수가 인원 수보다 많으면 400 에러가 발생한다.', async () => {
            await request(app.getHttpServer())
                .post('/user/signUp')
                .send({
                    email: "test2@test.com",
                    password: "test1234",
                    nickname: "tester2"
                });

            const response = await request(app.getHttpServer())
                .patch('/record/1')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    headCount: 1,
                    party: [2]
                });

            expect(response.status).toBe(400);
        });

        it('추가하려는 일행이 존재하지 않는 사용자면 404 에러가 발생한다.', async () => {
            const response = await request(app.getHttpServer())
                .patch('/record/1')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    party: [2]
                });

            expect(response.status).toBe(404);
        });

        it('삭제하려는 일행이 이미 작성한 리뷰가 있으면 409 에러가 발생한다.', async () => {
            await request(app.getHttpServer())
                .post('/user/signUp')
                .send({
                    email: "test2@test.com",
                    password: "test1234",
                    nickname: "tester2"
                });

            await request(app.getHttpServer())
                .patch('/record/1')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    party: [2]
                });

            const loginResponse = await request(app.getHttpServer())
                .post('/user/signIn')
                .send({
                    email: "test2@test.com",
                    password: "test1234",
                });
            accessToken = loginResponse.body.accessToken;

            await request(app.getHttpServer())
                .post('/review')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    recordId: 1,
                    content: "test review content",
                    activity: 5
                });

            const originalLoginResponse = await request(app.getHttpServer())
                .post('/user/signIn')
                .send({
                    email: "test1@test.com",
                    password: "test1234",
                });
            accessToken = originalLoginResponse.body.accessToken;

            const response = await request(app.getHttpServer())
                .patch('/record/1')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    party: []
                });

            expect(response.status).toBe(409);
        });
    });

    describe('PATCH /record/{recordId}/visibility', () => {
        it('기록의 공개여부를 수정한다.', async () => {
            const response = await request(app.getHttpServer())
                .patch('/record/1/visibility')
                .set('Authorization', `Bearer ${accessToken}`)

            expect(response.status).toBe(200);
            const tag = await recordService.getOneTag(1, 1);
            expect(tag?.visibility === false);
        });

        it('존재하지 않는 기록을 수정하면 404 에러가 발생한다.', async () => {
            const response = await request(app.getHttpServer())
                .patch('/record/2/visibility')
                .set('Authorization', `Bearer ${accessToken}`)

            expect(response.status).toBe(404);
        });

        it('존재하지 않는 사용자가 요청하면 404 에러가 발생한다.', async () => { });

        it('해당 기록에 태그된 사용자가 아니면 403 에러가 발생한다.', async () => {
            await request(app.getHttpServer())
                .post('/user/signUp')
                .send({
                    email: "test2@test.com",
                    password: "test1234",
                    nickname: "tester2"
                });

            const loginResponse = await request(app.getHttpServer())
                .post('/user/signIn')
                .send({
                    email: "test2@test.com",
                    password: "test1234",
                });
            accessToken = loginResponse.body.accessToken;

            const response = await request(app.getHttpServer())
                .patch('/record/1/visibility')
                .set('Authorization', `Bearer ${accessToken}`)

            expect(response.status).toBe(403);
        });
    });

    describe('DELETE /record/{recordId}', () => {
        it('기록을 삭제한다.', async () => {
            const response = await request(app.getHttpServer())
                .delete('/record/1')
                .set('Authorization', `Bearer ${accessToken}`)

            expect(response.status).toBe(204);
            const record = await recordService.getRecordById(1);
            expect(record).toBeNull();
        });

        it('존재하지 않는 기록을 삭제하면 404 에러가 발생한다.', async () => {
            const response = await request(app.getHttpServer())
                .delete('/record/2')
                .set('Authorization', `Bearer ${accessToken}`)

            expect(response.status).toBe(404);
        });

        it('존재하지 않는 사용자가 요청하면 404 에러가 발생한다.', async () => { });

        it('기록을 등록한 사용자가 아닌 사용자가 요청하면 403 에러가 발생한다.', async () => {
            await request(app.getHttpServer())
                .post('/user/signUp')
                .send({
                    email: "test2@test.com",
                    password: "test1234",
                    nickname: "tester2"
                });

            const loginResponse = await request(app.getHttpServer())
                .post('/user/signIn')
                .send({
                    email: "test2@test.com",
                    password: "test1234",
                });
            accessToken = loginResponse.body.accessToken;

            const response = await request(app.getHttpServer())
                .delete('/record/1')
                .set('Authorization', `Bearer ${accessToken}`)

            expect(response.status).toBe(403);
        });

        it('기록에 리뷰가 존재하면 400 에러가 발생한다.', async () => {
            await request(app.getHttpServer())
                .post('/review')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    recordId: 1,
                    content: "test review content",
                    rate: 5,
                });

            const response = await request(app.getHttpServer())
                .delete('/record/1')
                .set('Authorization', `Bearer ${accessToken}`)

            expect(response.status).toBe(400);
        });
    });

    afterAll(async () => {
        await app.close();
    })
})