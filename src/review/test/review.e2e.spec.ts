import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from "@nestjs/common";
import { AppModule } from "../../app.module";
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { LocationEnum } from '../../store/domain/location.enum';
import { ThemeRepository } from '../../theme/domain/theme.repository';
import { StoreRepository } from '../../store/domain/store.repository';
import { REVIEW_REPOSITORY, STORE_REPOSITORY, THEME_REPOSITORY } from '../../common/inject.constant';
import { Store } from '../../store/domain/store.entity';
import { Theme } from '../../theme/domain/theme.entity';
import { ReviewRepository } from '../domain/review.repository';

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

        dataSource = moduleRef.get<DataSource>(DataSource);
        themeRepository = moduleRef.get<ThemeRepository>(THEME_REPOSITORY);
        storeRepository = moduleRef.get<StoreRepository>(STORE_REPOSITORY);
        reviewRepository = moduleRef.get<ReviewRepository>(REVIEW_REPOSITORY);
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
            .field('headCount', 2);
    });

    describe('POST /review', () => {
        it('리뷰를 생성한다.', async () => {
            const loginResponse = await request(app.getHttpServer())
                .post('/user/signIn')
                .send({
                    email: 'test1@test.com',
                    password: 'test1234'
                });
            const accessToken = loginResponse.body.accessToken;

            const response = await request(app.getHttpServer())
                .post('/review')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    recordId: 1
                });

            expect(response.status).toBe(201);
            const review = await reviewRepository.findOneById(1);
            expect(review).toBeDefined();

            // await request(app.getHttpServer())
            //     .post('/user/signUp')
            //     .send({
            //         email: 'test2@test.com',
            //         password: 'test1234',
            //         nickname: 'tester2'
            //     });
            // const loginResponse = await request(app.getHttpServer())
            //     .post('/user/signIn')
            //     .send({
            //         email: 'test1@test.com',
            //         password: 'test1234'
            //     });
            // const accessToken = loginResponse.body.accessToken;
            // await request(app.getHttpServer())
            //     .post('/record')
            //     .set('Authorization', `Bearer ${accessToken}`)
            //     .field('themeId', 1)
            //     .field('isSuccess', 'true')
            //     .field('playDate', '2024-01-01')
            //     .field('headCount', 2)
            //     .field('party[0]', 2);
            // const loginResponse2 = await request(app.getHttpServer())
            //     .post('/user/signIn')
            //     .send({
            //         email: 'test2@test.com',
            //         password: 'test1234'
            //     });
            // const accessToken2 = loginResponse2.body.accessToken;

            // const response = await request(app.getHttpServer())
            //     .post('/review')
            //     .set('Authorization', `Bearer ${accessToken2}`)
            //     .send({
            //         recordId: 2
            //     });

            // expect(response.status).toBe(201);
            // const review = await reviewRepository.findOneById(1);
            // expect(review).toBeDefined();
        });

        it('존재하지 않는 기록에 리뷰를 생성하면 404 에러가 발생한다.', async () => {
            const loginResponse = await request(app.getHttpServer())
                .post('/user/signIn')
                .send({
                    email: 'test1@test.com',
                    password: 'test1234'
                });
            const accessToken = loginResponse.body.accessToken;

            const response = await request(app.getHttpServer())
                .post('/review')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    recordId: 2
                });

            expect(response.status).toBe(404);
        });

        it('기록에 태그되지 않은 사용자가 요청하면 403 에러가 발생한다.', async () => {
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
                .post('/review')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    recordId: 1
                });

            expect(response.status).toBe(403);
        });

        it('해당 기록에 이미 작성한 리뷰가 있으면 403 에러가 발생한다.', async () => {
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
                .post('/review')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    recordId: 1
                });

            expect(response.status).toBe(403);
        });
    });

    describe('PATCH /review/{reviewId}', () => {
        it('리뷰를 수정한다.', async () => {
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
                .patch('/review/1')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    activity: 2
                });

            expect(response.status).toBe(200);
            const review = await reviewRepository.findOneById(1);
            expect(review?.getActivity()).toBe(2);
        });

        it('존재하지 않는 리뷰를 수정하면 404 에러가 발생한다.', async () => {
            const loginResponse = await request(app.getHttpServer())
                .post('/user/signIn')
                .send({
                    email: 'test1@test.com',
                    password: 'test1234'
                });
            const accessToken = loginResponse.body.accessToken;

            const response = await request(app.getHttpServer())
                .patch('/review/1')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    activity: 2
                });

            expect(response.status).toBe(404);
        });

        it('리뷰를 등록한 사용자가 아니면 403 에러가 발생한다.', async () => {
            const loginResponse1 = await request(app.getHttpServer())
                .post('/user/signIn')
                .send({
                    email: 'test1@test.com',
                    password: 'test1234'
                });
            const accessToken1 = loginResponse1.body.accessToken;
            await request(app.getHttpServer())
                .post('/review')
                .set('Authorization', `Bearer ${accessToken1}`)
                .send({
                    recordId: 1
                });

            await request(app.getHttpServer())
                .post('/user/signUp')
                .send({
                    email: 'test2@test.com',
                    password: 'test1234',
                    nickname: 'tester2'
                });
            const loginResponse2 = await request(app.getHttpServer())
                .post('/user/signIn')
                .send({
                    email: 'test2@test.com',
                    password: 'test1234'
                });
            const accessToken2 = loginResponse2.body.accessToken;

            const response = await request(app.getHttpServer())
                .patch('/review/1')
                .set('Authorization', `Bearer ${accessToken2}`)
                .send({
                    activity: 2
                });

            expect(response.status).toBe(403);
        });
    });

    describe('DELETE /review/{reviewId}', () => {
        it('리뷰를 삭제한다.', async () => {
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
                .delete('/review/1')
                .set('Authorization', `Bearer ${accessToken}`);

            expect(response.status).toBe(204);
            const review = await reviewRepository.findOneById(1);
            expect(review).toBeNull();
        });

        it('존재하지 않는 리뷰를 삭제하면 404 에러가 발생한다.', async () => {
            const loginResponse = await request(app.getHttpServer())
                .post('/user/signIn')
                .send({
                    email: 'test1@test.com',
                    password: 'test1234'
                });
            const accessToken = loginResponse.body.accessToken;

            const response = await request(app.getHttpServer())
                .delete('/review/1')
                .set('Authorization', `Bearer ${accessToken}`);

            expect(response.status).toBe(404);
        });

        it('리뷰를 등록한 사용자가 아니면 403 에러가 발생한다.', async () => {
            const loginResponse1 = await request(app.getHttpServer())
                .post('/user/signIn')
                .send({
                    email: 'test1@test.com',
                    password: 'test1234'
                });
            const accessToken1 = loginResponse1.body.accessToken;
            await request(app.getHttpServer())
                .post('/review')
                .set('Authorization', `Bearer ${accessToken1}`)
                .send({
                    recordId: 1
                });

            await request(app.getHttpServer())
                .post('/user/signUp')
                .send({
                    email: 'test2@test.com',
                    password: 'test1234',
                    nickname: 'tester2'
                });
            const loginResponse2 = await request(app.getHttpServer())
                .post('/user/signIn')
                .send({
                    email: 'test2@test.com',
                    password: 'test1234'
                });
            const accessToken2 = loginResponse2.body.accessToken;

            const response = await request(app.getHttpServer())
                .delete('/review/1')
                .set('Authorization', `Bearer ${accessToken2}`);

            expect(response.status).toBe(403);
            const review = await reviewRepository.findOneById(1);
            expect(review).toBeDefined();
        });
    });

    afterAll(async () => {
        await app.close();
    })
})