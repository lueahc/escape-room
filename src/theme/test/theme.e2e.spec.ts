import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve('.local.env') });
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from "@nestjs/common";
import { AppModule } from "../../app.module";
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { LocationEnum } from '../../store/location.enum';
import { ThemeRepository } from '../domain/theme.repository';
import { StoreRepository } from '../../store/domain/store.repository';
import { STORE_REPOSITORY, THEME_REPOSITORY } from '../../common/inject.constant';
import { Store } from '../../store/domain/store.entity';
import { Theme } from '../domain/theme.entity';

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

        dataSource = moduleRef.get<DataSource>(DataSource);
        themeRepository = moduleRef.get<ThemeRepository>(THEME_REPOSITORY);
        storeRepository = moduleRef.get<StoreRepository>(STORE_REPOSITORY);
    });

    beforeEach(async () => {
        await dataSource.dropDatabase();
        await dataSource.synchronize();

        const store1 = new Store({
            name: 'test store1 name',
            location: LocationEnum.KANGNAM,
            address: 'test store1 address',
            phoneNo: 'test store1 phoneNo',
            homepageUrl: 'test store1 homepageUrl'
        });
        await storeRepository.save(store1);
        await themeRepository.save(new Theme({
            name: 'test theme1 name',
            image: 'test theme1 image',
            plot: 'test theme1 plot',
            genre: 'test theme1 genre',
            time: 70,
            level: 1,
            price: 27000,
            note: 'test theme1 note',
            store: store1
        }));
        await themeRepository.save(new Theme({
            name: 'test theme2 name',
            image: 'test theme2 image',
            plot: 'test theme2 plot',
            genre: 'test theme2 genre',
            time: 70,
            level: 1,
            price: 27000,
            note: 'test theme2 note',
            store: store1
        }));

        const store2 = new Store({
            name: 'test store2 name',
            location: LocationEnum.HONGDAE,
            address: 'test store2 address',
            phoneNo: 'test store2 phoneNo',
            homepageUrl: 'test store2 homepageUrl'
        });
        await storeRepository.save(store2);
        await themeRepository.save(new Theme({
            name: 'test theme3 name',
            image: 'test theme3 image',
            plot: 'test theme3 plot',
            genre: 'test theme3 genre',
            time: 70,
            level: 1,
            price: 27000,
            note: 'test theme3 note',
            store: store2
        }));
        await themeRepository.save(new Theme({
            name: 'test theme4 name',
            image: 'test theme4 image',
            plot: 'test theme4 plot',
            genre: 'test theme4 genre',
            time: 70,
            level: 1,
            price: 27000,
            note: 'test theme4 note',
            store: store2
        }));
    });

    describe('GET /theme/search', () => {
        it('테마를 검색한다.', async () => {
            const response = await request(app.getHttpServer())
                .get('/theme/search')
                .query({ keyword: 'theme1' });

            expect(response.status).toBe(200);
            for (const theme of response.body) {
                expect(theme).toBeDefined();
                expect(theme).toHaveProperty('id');
                expect(theme).toHaveProperty('storeName');
                expect(theme).toHaveProperty('storeLocation');
                expect(theme).toHaveProperty('themeName');
                expect(theme).toHaveProperty('image');
                expect(theme).toHaveProperty('plot');
                expect(theme).toHaveProperty('genre');
                expect(theme).toHaveProperty('time');
                expect(theme).toHaveProperty('level');
                expect(theme).toHaveProperty('price');
                expect(theme).toHaveProperty('reviewCount');
            }
        });
    });

    describe('GET /theme', () => {
        it('테마 목록을 조회한다.', async () => {
            const response = await request(app.getHttpServer())
                .get('/theme');

            expect(response.status).toBe(200);
            for (const theme of response.body) {
                expect(theme).toBeDefined();
                expect(theme).toHaveProperty('id');
                expect(theme).toHaveProperty('storeName');
                expect(theme).toHaveProperty('storeLocation');
                expect(theme).toHaveProperty('themeName');
                expect(theme).toHaveProperty('image');
                expect(theme).toHaveProperty('plot');
                expect(theme).toHaveProperty('genre');
                expect(theme).toHaveProperty('time');
                expect(theme).toHaveProperty('level');
                expect(theme).toHaveProperty('price');
                expect(theme).toHaveProperty('reviewCount');
            }
        });

        it('테마 목록을 지역 별로 조회한다.', async () => {
            const response = await request(app.getHttpServer())
                .get('/theme')
                .query({ location: '강남' });

            expect(response.status).toBe(200);
            for (const theme of response.body) {
                expect(theme).toBeDefined();
                expect(theme).toHaveProperty('id');
                expect(theme).toHaveProperty('storeName');
                expect(theme).toHaveProperty('storeLocation');
                expect(theme).toHaveProperty('themeName');
                expect(theme).toHaveProperty('image');
                expect(theme).toHaveProperty('plot');
                expect(theme).toHaveProperty('genre');
                expect(theme).toHaveProperty('time');
                expect(theme).toHaveProperty('level');
                expect(theme).toHaveProperty('price');
                expect(theme).toHaveProperty('reviewCount');
                expect(theme.storeLocation).toBe('강남');
            }
        });
    });

    describe('GET /theme/{themeId}', () => {
        it('특정 테마 정보를 조회한다.', async () => {
            const response = await request(app.getHttpServer())
                .get('/theme/1');

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('id');
            expect(response.body).toHaveProperty('themeName');
            expect(response.body).toHaveProperty('image');
            expect(response.body).toHaveProperty('plot');
            expect(response.body).toHaveProperty('genre');
            expect(response.body).toHaveProperty('time');
            expect(response.body).toHaveProperty('level');
            expect(response.body).toHaveProperty('price');
            expect(response.body).toHaveProperty('themeReviewCount');
            expect(response.body).toHaveProperty('storeId');
            expect(response.body).toHaveProperty('storeName');
            expect(response.body).toHaveProperty('storeLocation');
            expect(response.body).toHaveProperty('storeAddress');
            expect(response.body).toHaveProperty('storePhoneNo');
            expect(response.body).toHaveProperty('storeHomePageUrl');
            expect(response.body).toHaveProperty('storeReviewCount');
            expect(response.body).toHaveProperty('reviews');
            for (const review of response.body.reviews) {
                expect(review).toHaveProperty('id');
                expect(review).toHaveProperty('nickname');
                expect(review).toHaveProperty('storeName');
                expect(review).toHaveProperty('themeName');
                expect(review).toHaveProperty('playDate');
                expect(review).toHaveProperty('isSuccess');
                expect(review).toHaveProperty('headCount');
            }
        });
        it('존재하지 않는 테마 정보를 조회하면 404 에러가 발생한다.', async () => {
            const response = await request(app.getHttpServer())
                .get('/theme/5');

            expect(response.status).toBe(404);
        });
    });

    describe('GET /theme/{themeId}/review', () => {
        it('특정 테마의 리뷰 목록을 조회한다.', async () => {
            await request(app.getHttpServer())
                .post('/user/signUp')
                .send({
                    email: 'test@test.com',
                    password: 'test1234',
                    nickname: 'tester'
                });
            const loginResponse = await request(app.getHttpServer())
                .post('/user/signIn')
                .send({
                    email: 'test@test.com',
                    password: 'test1234'
                });
            const accessToken = loginResponse.body.accessToken;

            await request(app.getHttpServer())
                .post('/record')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    themeId: 1,
                    isSuccess: 'true',
                    playDate: '2024-01-01',
                    headCount: 4,
                });
            await request(app.getHttpServer())
                .post('/review')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    recordId: 1,
                    content: 'test review content',
                    rate: 4
                });

            const response = await request(app.getHttpServer())
                .get('/theme/1/review');

            expect(response.status).toBe(200);
            for (const review of response.body) {
                expect(review).toHaveProperty('id');
                expect(review).toHaveProperty('nickname');
                expect(review).toHaveProperty('storeName');
                expect(review).toHaveProperty('themeName');
                expect(review).toHaveProperty('playDate');
                expect(review).toHaveProperty('isSuccess');
                expect(review).toHaveProperty('headCount');
            }
        });
    });

    afterAll(async () => {
        await app.close();
    })
})