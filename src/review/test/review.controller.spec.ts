import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { DataSource } from 'typeorm';
import { ReviewController } from '../review.controller';
import { ReviewService } from '../review.service';
import { ThemeRepository } from '../../theme/domain/theme.repository';
import { StoreRepository } from '../../store/domain/store.repository';
import { STORE_REPOSITORY, THEME_REPOSITORY } from '../../common/inject.constant';
import { Store } from '../../store/domain/store.entity';
import { LocationEnum } from '../../store/domain/location.enum';
import { Theme } from '../../theme/domain/theme.entity';
import { CreateReviewRequestDto } from '../dto/createReview.request.dto';
import { UpdateReviewRequestDto } from '../dto/updateReview.request.dto';
jest.mock('../review.service');

describe('ReviewController', () => {
    let app: INestApplication;
    let dataSource: DataSource;
    let themeRepository: ThemeRepository;
    let storeRepository: StoreRepository;
    let reviewController: ReviewController;
    let reviewService: ReviewService;
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
        reviewController = moduleRef.get<ReviewController>(ReviewController);
        reviewService = moduleRef.get<ReviewService>(ReviewService);
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
        accessToken = loginResponse.body.accessToken;
        await request(app.getHttpServer())
            .post('/record')
            .set('Authorization', `Bearer ${accessToken}`)
            .field('themeId', 1)
            .field('isSuccess', 'true')
            .field('playDate', '2024-01-01')
            .field('headCount', 2);
    });

    describe('POST /review', () => {
        it('성공 시 상태코드 201로 응답한다.', () => {
            request(app.getHttpServer())
                .post('/review')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    recordId: 1
                })
                .expect(201);
        });

        it('recordId가 비어있으면 400 에러가 발생한다.', () => {
            request(app.getHttpServer())
                .post('/review')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(400);
        });

        it('reviewService.createReview를 호출한다.', async () => {
            const userId = 1;
            const dto: CreateReviewRequestDto = {
                recordId: 1,
                content: '',
                rate: 1,
                activity: 1,
                story: 1,
                dramatic: 1,
                volume: 1,
                problem: 1,
                difficulty: 1,
                horror: 1,
                interior: 1,
            };
            jest.spyOn(reviewService, 'createReview').mockImplementation(async () => { });
            await reviewController.createReview(userId, dto);
            expect(reviewService.createReview).toHaveBeenCalledWith(userId, dto);
        });
    });

    describe('PATCH /review/{reviewId}', () => {
        beforeEach(async () => {
            await request(app.getHttpServer())
                .post('/review')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    recordId: 1,
                    content: 'good'
                });
        });

        it('성공 시 상태코드 200으로 응답한다.', async () => {
            request(app.getHttpServer())
                .patch('/review/1')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    content: 'nice'
                })
                .expect(200);
        });

        it('reviewService.updateReview를 호출한다.', async () => {
            const userId = 1;
            const reviewId = 1;
            const dto: UpdateReviewRequestDto = {
                content: '',
                rate: 1,
                activity: 1,
                story: 1,
                dramatic: 1,
                volume: 1,
                problem: 1,
                difficulty: 1,
                horror: 1,
                interior: 1,
            };
            jest.spyOn(reviewService, 'updateReview').mockImplementation(async () => { });
            await reviewController.updateReview(userId, reviewId, dto);
            expect(reviewService.updateReview).toHaveBeenCalledWith(userId, reviewId, dto);
        });
    });

    describe('DELETE /review/{reviewId}', () => {
        it('성공 시 상태코드 204로 응답한다.', () => {
            request(app.getHttpServer())
                .delete('/review/1')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(204);
        });

        it('reviewService.deleteReview를 호출한다.', async () => {
            const userId = 1;
            const reviewId = 1;
            jest.spyOn(reviewService, 'deleteReview').mockImplementation(async () => { });
            await reviewController.deleteReview(userId, reviewId);
            expect(reviewService.deleteReview).toHaveBeenCalledWith(userId, reviewId);
        });
    });

    afterAll(async () => {
        await app.close();
    });
});