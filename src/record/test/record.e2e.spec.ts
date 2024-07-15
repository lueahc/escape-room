import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from "@nestjs/common";
import { AppModule } from "../../app.module";
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { LocationEnum } from '../../store/domain/location.enum';
import { StoreRepository } from '../../store/domain/store.repository';
import { ThemeRepository } from '../../theme/domain/theme.repository';
import { RECORD_REPOSITORY, STORE_REPOSITORY, THEME_REPOSITORY } from '../../common/inject.constant';
import { Store } from '../../store/domain/store.entity';
import { Theme } from '../../theme/domain/theme.entity';
import { RecordRepository } from '../domain/record.repository';

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

        dataSource = moduleRef.get<DataSource>(DataSource);
        themeRepository = moduleRef.get<ThemeRepository>(THEME_REPOSITORY);
        storeRepository = moduleRef.get<StoreRepository>(STORE_REPOSITORY);
        recordRepository = moduleRef.get<RecordRepository>(RECORD_REPOSITORY);
    });

    beforeEach(async () => {
        await dataSource.dropDatabase();
        await dataSource.synchronize();

        const store = new Store({
            name: 'test store1 name',
            location: LocationEnum.KANGNAM,
            address: 'test store address',
            phoneNo: 'test store phoneNo',
            homepageUrl: 'test store homepageUrl'
        });
        await storeRepository.save(store);
        await themeRepository.save(new Theme({
            name: 'test theme name',
            image: 'test theme image',
            plot: 'test theme plot',
            genre: 'test theme genre',
            time: 70,
            level: 1,
            price: 27000,
            note: 'test theme note',
            store: store
        }));

        await request(app.getHttpServer())
            .post('/user/signUp')
            .send({
                email: 'test1@test.com',
                password: 'test1234',
                nickname: 'tester1'
            });
    });

    describe('GET /record/log', () => {
        it('사용자의 탈출일지를 조회한다.', async () => {
            const loginResponse = await request(app.getHttpServer())
                .post('/user/signIn')
                .send({
                    email: 'test1@test.com',
                    password: 'test1234'
                });
            const accessToken = loginResponse.body.accessToken;
            await request(app.getHttpServer())
                .post('/record')
                .set('Authorization', `Bearer ${accessToken}`)
                .field('themeId', 1)
                .field('isSuccess', 'true')
                .field('playDate', '2024-01-01')
                .field('headCount', 4);

            const response = await request(app.getHttpServer())
                .get('/record/log')
                .set('Authorization', `Bearer ${accessToken}`);

            expect(response.status).toBe(200);
            for (const record of response.body) {
                expect(record).toHaveProperty('id');
                expect(record).toHaveProperty('playDate');
                expect(record).toHaveProperty('storeName');
                expect(record).toHaveProperty('themeName');
                expect(record).toHaveProperty('isSuccess');
            }
        });
    });

    describe('GET /record', () => {
        let accessToken: string;
        beforeEach(async () => {
            const loginResponse = await request(app.getHttpServer())
                .post('/user/signIn')
                .send({
                    email: 'test1@test.com',
                    password: 'test1234'
                });
            accessToken = loginResponse.body.accessToken;

            await request(app.getHttpServer())
                .post('/record')
                .set('Authorization', `Bearer ${accessToken}`)
                .field('themeId', 1)
                .field('isSuccess', 'true')
                .field('playDate', '2024-01-01')
                .field('headCount', 4);
            await request(app.getHttpServer())
                .post('/record')
                .set('Authorization', `Bearer ${accessToken}`)
                .field('themeId', 1)
                .field('isSuccess', 'true')
                .field('playDate', '2024-01-01')
                .field('headCount', 4);
            await request(app.getHttpServer())
                .post('/record')
                .set('Authorization', `Bearer ${accessToken}`)
                .field('themeId', 1)
                .field('isSuccess', 'true')
                .field('playDate', '2024-01-01')
                .field('headCount', 4);
            await request(app.getHttpServer())
                .patch('/record/1/visibility')
                .set('Authorization', `Bearer ${accessToken}`)
        });

        it('공개 설정된 기록리뷰 목록을 조회한다.', async () => {
            const response = await request(app.getHttpServer())
                .get('/record')
                .set('Authorization', `Bearer ${accessToken}`)
                .query({ visibility: 'true' });

            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(2);
        });

        it('비공개 설정된 기록리뷰 목록을 조회한다.', async () => {
            const response = await request(app.getHttpServer())
                .get('/record')
                .set('Authorization', `Bearer ${accessToken}`)
                .query({ visibility: 'false' });

            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(1);
        });

        it('기록리뷰 목록 전체 조회한다.', async () => {
            const response = await request(app.getHttpServer())
                .get('/record')
                .set('Authorization', `Bearer ${accessToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(3);
        });
    });

    describe('GET /record/{recordId}', () => {
        it('존재하지 않은 기록을 조회하면 404 에러가 발생한다.', async () => {
            const loginResponse = await request(app.getHttpServer())
                .post('/user/signIn')
                .send({
                    email: 'test1@test.com',
                    password: 'test1234'
                });
            const accessToken = loginResponse.body.accessToken;
            await request(app.getHttpServer())
                .post('/record')
                .set('Authorization', `Bearer ${accessToken}`)
                .field('themeId', 1)
                .field('isSuccess', 'true')
                .field('playDate', '2024-01-01')
                .field('headCount', 4);

            const response = await request(app.getHttpServer())
                .get('/record/2')
                .set('Authorization', `Bearer ${accessToken}`);

            expect(response.status).toBe(404);
        })
    });

    describe('GET /record/{recordId}/tag', () => {
        it('특정한 기록에 태그된 사용자를 조회한다.', async () => {
            await request(app.getHttpServer())
                .post('/user/signUp')
                .send({
                    email: 'test2@test.com',
                    password: 'test1234',
                    nickname: 'tester2'
                });
            const loginResponse = await request(app.getHttpServer())
                .post('/user/signIn')
                .send({
                    email: 'test1@test.com',
                    password: 'test1234'
                });
            const accessToken = loginResponse.body.accessToken;
            await request(app.getHttpServer())
                .post('/record')
                .set('Authorization', `Bearer ${accessToken}`)
                .field('themeId', 1)
                .field('isSuccess', 'true')
                .field('playDate', '2024-01-01')
                .field('headCount', 4)
                .field('party[0]', 2);

            const response = await request(app.getHttpServer())
                .get('/record/1/tag')
                .set('Authorization', `Bearer ${accessToken}`)

            expect(response.status).toBe(200);
            expect(response.body[0]).toBe('tester2');
        });
    });

    describe('POST /record', () => {
        let accessToken: string;

        beforeEach(async () => {
            const loginResponse = await request(app.getHttpServer())
                .post('/user/signIn')
                .send({
                    email: 'test1@test.com',
                    password: 'test1234'
                });
            accessToken = loginResponse.body.accessToken;
        });
        it('기록을 생성한다.', async () => {
            const response = await request(app.getHttpServer())
                .post('/record')
                .set('Authorization', `Bearer ${accessToken}`)
                .field('themeId', 1)
                .field('isSuccess', 'true')
                .field('playDate', '2024-01-01')
                .field('headCount', 4);

            expect(response.status).toBe(201);
            const record = await recordRepository.findOneById(1);
            expect(record).toBeDefined();
        });

        it('존재하지 않는 테마에 기록을 생성하면 404 에러가 발생한다.', async () => {
            const response = await request(app.getHttpServer())
                .post('/record')
                .set('Authorization', `Bearer ${accessToken}`)
                .field('themeId', 2)
                .field('isSuccess', 'true')
                .field('playDate', '2024-01-01')
                .field('headCount', 4);

            expect(response.status).toBe(404);
        });

        it('일행으로 추가할 사용자 수가 인원 수보다 많으면 400 에러가 발생한다.', async () => {
            const response = await request(app.getHttpServer())
                .post('/record')
                .set('Authorization', `Bearer ${accessToken}`)
                .field('themeId', 1)
                .field('isSuccess', 'true')
                .field('playDate', '2024-01-01')
                .field('headCount', 1)
                .field('party[0]', 2);

            expect(response.status).toBe(400);
        });

        it('추가하려는 일행이 존재하지 않는 사용자면 404 에러가 발생한다.', async () => {
            const response = await request(app.getHttpServer())
                .post('/record')
                .set('Authorization', `Bearer ${accessToken}`)
                .field('themeId', 1)
                .field('isSuccess', 'true')
                .field('playDate', '2024-01-01')
                .field('headCount', 2)
                .field('party[0]', 2);

            expect(response.status).toBe(404);
        });
    });

    describe('PATCH /record/{recordId}', () => {
        beforeEach(async () => {
            const loginResponse = await request(app.getHttpServer())
                .post('/user/signIn')
                .send({
                    email: 'test1@test.com',
                    password: 'test1234'
                });
            const accessToken = loginResponse.body.accessToken;
            await request(app.getHttpServer())
                .post('/record')
                .set('Authorization', `Bearer ${accessToken}`)
                .field('themeId', 1)
                .field('isSuccess', 'true')
                .field('playDate', '2024-01-01')
                .field('headCount', 4);
        });

        it('기록의 내용을 수정한다.', async () => {
            const loginResponse = await request(app.getHttpServer())
                .post('/user/signIn')
                .send({
                    email: 'test1@test.com',
                    password: 'test1234'
                });
            const accessToken = loginResponse.body.accessToken;

            const response = await request(app.getHttpServer())
                .patch('/record/1')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    headCount: 3
                });

            expect(response.status).toBe(200);
            const record = await recordRepository.findOneById(1);
            expect(record?.getHeadCount()).toBe(3);
        });

        it('존재하지 않는 기록을 수정하면 404 에러가 발생한다.', async () => {
            const loginResponse = await request(app.getHttpServer())
                .post('/user/signIn')
                .send({
                    email: 'test1@test.com',
                    password: 'test1234'
                });
            const accessToken = loginResponse.body.accessToken;

            const response = await request(app.getHttpServer())
                .patch('/record/2')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    headCount: 3,
                });

            expect(response.status).toBe(404);
        });

        it('기록을 등록한 사용자가 아닌 사용자가 요청하면 403 에러가 발생한다.', async () => {
            await request(app.getHttpServer())
                .post('/user/signUp')
                .send({
                    email: 'test2@test.com',
                    password: 'test1234',
                    nickname: 'tester2'
                });
            const loginResponse = await request(app.getHttpServer())
                .post('/user/signIn')
                .send({
                    email: 'test2@test.com',
                    password: 'test1234'
                });
            const accessToken = loginResponse.body.accessToken;

            const response = await request(app.getHttpServer())
                .patch('/record/1')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    headCount: 3,
                });

            expect(response.status).toBe(403);
        });

        it('일행으로 추가할 사용자 수가 인원 수보다 많으면 400 에러가 발생한다.', async () => {
            const loginResponse = await request(app.getHttpServer())
                .post('/user/signIn')
                .send({
                    email: 'test1@test.com',
                    password: 'test1234'
                });
            const accessToken = loginResponse.body.accessToken;

            const response = await request(app.getHttpServer())
                .patch('/record/1')
                .set('Authorization', `Bearer ${accessToken}`)
                .field('headCount', 1)
                .field('party[0]', 2);

            expect(response.status).toBe(400);
        });

        it('추가하려는 일행이 존재하지 않는 사용자면 404 에러가 발생한다.', async () => {
            const loginResponse = await request(app.getHttpServer())
                .post('/user/signIn')
                .send({
                    email: 'test1@test.com',
                    password: 'test1234'
                });
            const accessToken = loginResponse.body.accessToken;

            const response = await request(app.getHttpServer())
                .patch('/record/1')
                .set('Authorization', `Bearer ${accessToken}`)
                .field('headCount', 2)
                .field('party[0]', 2);

            expect(response.status).toBe(404);
        });

        it('삭제하려는 일행이 이미 작성한 리뷰가 있으면 409 에러가 발생한다.', async () => {
            await request(app.getHttpServer())
                .post('/user/signUp')
                .send({
                    email: 'test2@test.com',
                    password: 'test1234',
                    nickname: 'tester2'
                });
            const loginResponse1 = await request(app.getHttpServer())
                .post('/user/signIn')
                .send({
                    email: 'test1@test.com',
                    password: 'test1234'
                });
            const accessToken1 = loginResponse1.body.accessToken;
            await request(app.getHttpServer())
                .patch('/record/1')
                .set('Authorization', `Bearer ${accessToken1}`)
                .field('party[0]', 2);
            const loginResponse2 = await request(app.getHttpServer())
                .post('/user/signIn')
                .send({
                    email: 'test2@test.com',
                    password: 'test1234'
                });
            const accessToken2 = loginResponse2.body.accessToken;
            await request(app.getHttpServer())
                .post('/review')
                .set('Authorization', `Bearer ${accessToken2}`)
                .send({
                    recordId: 1
                });

            const response = await request(app.getHttpServer())
                .patch('/record/1')
                .set('Authorization', `Bearer ${accessToken1}`);

            expect(response.status).toBe(409);
        });
    });

    describe('PATCH /record/{recordId}/visibility', () => {
        beforeEach(async () => {
            const loginResponse = await request(app.getHttpServer())
                .post('/user/signIn')
                .send({
                    email: 'test1@test.com',
                    password: 'test1234'
                });
            const accessToken = loginResponse.body.accessToken;
            await request(app.getHttpServer())
                .post('/record')
                .set('Authorization', `Bearer ${accessToken}`)
                .field('themeId', 1)
                .field('isSuccess', 'true')
                .field('playDate', '2024-01-01')
                .field('headCount', 4);
        });

        it('기록의 공개여부를 수정한다.', async () => {
            const loginResponse = await request(app.getHttpServer())
                .post('/user/signIn')
                .send({
                    email: 'test1@test.com',
                    password: 'test1234'
                });
            const accessToken = loginResponse.body.accessToken;

            const response = await request(app.getHttpServer())
                .patch('/record/1/visibility')
                .set('Authorization', `Bearer ${accessToken}`)

            expect(response.status).toBe(204);
            const tag = await recordRepository.getOneTag(1, 1);
            expect(tag?.getVisibility()).toBe(false);
        });

        it('존재하지 않는 기록을 수정하면 404 에러가 발생한다.', async () => {
            const loginResponse = await request(app.getHttpServer())
                .post('/user/signIn')
                .send({
                    email: 'test1@test.com',
                    password: 'test1234'
                });
            const accessToken = loginResponse.body.accessToken;

            const response = await request(app.getHttpServer())
                .patch('/record/2/visibility')
                .set('Authorization', `Bearer ${accessToken}`)

            expect(response.status).toBe(404);
        });

        it('해당 기록에 태그된 사용자가 아니면 403 에러가 발생한다.', async () => {
            await request(app.getHttpServer())
                .post('/user/signUp')
                .send({
                    email: 'test2@test.com',
                    password: 'test1234',
                    nickname: "tester2"
                });
            const loginResponse = await request(app.getHttpServer())
                .post('/user/signIn')
                .send({
                    email: 'test2@test.com',
                    password: 'test1234'
                });
            const accessToken = loginResponse.body.accessToken;

            const response = await request(app.getHttpServer())
                .patch('/record/1/visibility')
                .set('Authorization', `Bearer ${accessToken}`)

            expect(response.status).toBe(403);
        });
    });

    describe('DELETE /record/{recordId}', () => {
        beforeEach(async () => {
            const loginResponse = await request(app.getHttpServer())
                .post('/user/signIn')
                .send({
                    email: 'test1@test.com',
                    password: 'test1234'
                });
            const accessToken = loginResponse.body.accessToken;
            await request(app.getHttpServer())
                .post('/record')
                .set('Authorization', `Bearer ${accessToken}`)
                .field('themeId', 1)
                .field('isSuccess', 'true')
                .field('playDate', '2024-01-01')
                .field('headCount', 4);
        });

        it('기록을 삭제한다.', async () => {
            const loginResponse = await request(app.getHttpServer())
                .post('/user/signIn')
                .send({
                    email: 'test1@test.com',
                    password: 'test1234'
                });
            const accessToken = loginResponse.body.accessToken;

            const response = await request(app.getHttpServer())
                .delete('/record/1')
                .set('Authorization', `Bearer ${accessToken}`)

            expect(response.status).toBe(204);
            const record = await recordRepository.findOneById(1);
            expect(record).toBeNull();
        });

        it('존재하지 않는 기록을 삭제하면 404 에러가 발생한다.', async () => {
            const loginResponse = await request(app.getHttpServer())
                .post('/user/signIn')
                .send({
                    email: 'test1@test.com',
                    password: 'test1234'
                });
            const accessToken = loginResponse.body.accessToken;

            const response = await request(app.getHttpServer())
                .delete('/record/2')
                .set('Authorization', `Bearer ${accessToken}`)

            expect(response.status).toBe(404);
        });

        it('기록을 등록한 사용자가 아닌 사용자가 요청하면 403 에러가 발생한다.', async () => {
            await request(app.getHttpServer())
                .post('/user/signUp')
                .send({
                    email: 'test2@test.com',
                    password: 'test1234',
                    nickname: 'tester2'
                });
            const loginResponse = await request(app.getHttpServer())
                .post('/user/signIn')
                .send({
                    email: 'test2@test.com',
                    password: 'test1234'
                });
            const accessToken = loginResponse.body.accessToken;

            const response = await request(app.getHttpServer())
                .delete('/record/1')
                .set('Authorization', `Bearer ${accessToken}`)

            expect(response.status).toBe(403);
        });

        it('기록에 리뷰가 존재하면 400 에러가 발생한다.', async () => {
            const loginResponse = await request(app.getHttpServer())
                .post('/user/signIn')
                .send({
                    email: 'test1@test.com',
                    password: 'test1234'
                });
            const accessToken = loginResponse.body.accessToken;
            await request(app.getHttpServer())
                .post('/review')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    recordId: 1
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