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
import { Theme } from '../../theme/theme.entity';
import { Store } from '../../store/store.entity';
import { LocationEnum } from '../../store/location.enum';
import { ReviewService } from '../review.service';

describe('ReviewController (E2E)', () => {
    let app: INestApplication;
    let reviewService: ReviewService;
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

        reviewService = moduleRef.get<ReviewService>(ReviewService);
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
    });

    describe('POST /review', () => {
        it('리뷰를 생성한다.', async () => {
            await request(app.getHttpServer())
                .post('/record')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    themeId: 1,
                    isSuccess: true,
                    playDate: "2024-01-01",
                    headCount: 4,
                });

            const response = await request(app.getHttpServer())
                .post('/review')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    recordId: 1
                });

            expect(response.status).toBe(201);
            const createdReview = await reviewService.getReviewById(1);
            expect(createdReview).toBeDefined();
        });

        it('존재하지 않는 기록에 리뷰를 생성하면 404 에러가 발생한다.', async () => {
            const response = await request(app.getHttpServer())
                .post('/review')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    recordId: 1
                });

            expect(response.status).toBe(404);
        });

        it('존재하지 않는 사용자가 요청하면 404 에러가 발생한다.', async () => { });

        it('기록에 태그되지 않은 사용자가 요청하면 403 에러가 발생한다.', async () => {
            await request(app.getHttpServer())
                .post('/record')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    themeId: 1,
                    isSuccess: true,
                    playDate: "2024-01-01",
                    headCount: 4,
                });

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
                .post('/review')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    recordId: 1
                });

            expect(response.status).toBe(403);
        });

        it('해당 기록에 이미 작성한 리뷰가 있으면 403 에러가 발생한다.', async () => {
            await request(app.getHttpServer())
                .post('/record')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    themeId: 1,
                    isSuccess: true,
                    playDate: "2024-01-01",
                    headCount: 4,
                });

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
            await request(app.getHttpServer())
                .post('/record')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    themeId: 1,
                    isSuccess: true,
                    playDate: "2024-01-01",
                    headCount: 4,
                });

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
            const updatedReview = await reviewService.getReviewById(1);
            if (updatedReview) expect(updatedReview.activity).toBe(2);
        });

        it('존재하지 않는 리뷰를 수정하면 404 에러가 발생한다.', async () => {
            const response = await request(app.getHttpServer())
                .patch('/review/1')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    activity: 2
                });

            expect(response.status).toBe(404);
        });

        it('존재하지 않는 사용자가 요청하면 404 에러가 발생한다.', async () => { });

        it('리뷰를 등록한 사용자가 아니면 403 에러가 발생한다.', async () => {
            await request(app.getHttpServer())
                .post('/record')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    themeId: 1,
                    isSuccess: true,
                    playDate: "2024-01-01",
                    headCount: 4,
                });

            await request(app.getHttpServer())
                .post('/review')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    recordId: 1
                });

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
                .patch('/review/1')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    activity: 2
                });

            expect(response.status).toBe(403);
            const updatedReview = await reviewService.getReviewById(1);
            if (updatedReview) expect(updatedReview.activity).toBeNull();
        });
    });

    describe('DELETE /review/{reviewId}', () => {
        it('리뷰를 삭제한다.', async () => {
            await request(app.getHttpServer())
                .post('/record')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    themeId: 1,
                    isSuccess: true,
                    playDate: "2024-01-01",
                    headCount: 4,
                });

            await request(app.getHttpServer())
                .post('/review')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    recordId: 1
                });

            const response = await request(app.getHttpServer())
                .delete('/review/1')
                .set('Authorization', `Bearer ${accessToken}`)

            expect(response.status).toBe(204);
            const review = await reviewService.getReviewById(1);
            expect(review).toBeNull();
        });

        it('존재하지 않는 리뷰를 삭제하면 404 에러가 발생한다.', async () => {
            const response = await request(app.getHttpServer())
                .delete('/review/1')
                .set('Authorization', `Bearer ${accessToken}`)

            expect(response.status).toBe(404);
        });

        it('존재하지 않는 사용자가 요청하면 404 에러가 발생한다.', async () => { });

        it('리뷰를 등록한 사용자가 아니면 403 에러가 발생한다.', async () => {
            await request(app.getHttpServer())
                .post('/record')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    themeId: 1,
                    isSuccess: true,
                    playDate: "2024-01-01",
                    headCount: 4,
                });

            await request(app.getHttpServer())
                .post('/review')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    recordId: 1
                });

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
                .delete('/review/1')
                .set('Authorization', `Bearer ${accessToken}`)

            expect(response.status).toBe(403);
            const review = await reviewService.getReviewById(1);
            expect(review).toBeDefined();
        });
    });

    afterAll(async () => {
        await app.close();
    })
})