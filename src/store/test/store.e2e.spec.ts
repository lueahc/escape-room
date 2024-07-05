import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve('.local.env') });
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from "@nestjs/common";
import { AppModule } from "../../app.module";
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { ThemeRepository } from 'src/theme/domain/theme.repository';
import { StoreRepository } from '../domain/store.repository';
import { STORE_REPOSITORY, THEME_REPOSITORY } from '../../common/inject.constant';
import { Store } from '../domain/store.entity';
import { Theme } from '../../theme/domain/theme.entity';
import { LocationEnum } from '../location.enum';

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

    describe('GET /store/search', () => {
        it('매장을 검색한다.', async () => {
            const response = await request(app.getHttpServer())
                .get('/store/search')
                .query({ keyword: 'store1' });

            expect(response.status).toBe(200);
            for (const store of response.body) {
                expect(store).toBeDefined();
                expect(store).toHaveProperty('id');
                expect(store).toHaveProperty('name');
                expect(store).toHaveProperty('location');
                expect(store).toHaveProperty('reviewCount');
            }
        });
    });

    describe('GET /store', () => {
        it('매장 목록을 조회한다.', async () => {
            const response = await request(app.getHttpServer())
                .get('/store');

            expect(response.status).toBe(200);
            for (const store of response.body) {
                expect(store).toBeDefined();
                expect(store).toHaveProperty('id');
                expect(store).toHaveProperty('name');
                expect(store).toHaveProperty('location');
                expect(store).toHaveProperty('reviewCount');
            }
        });

        it('매장 목록을 지역 별로 조회한다.', async () => {
            const response = await request(app.getHttpServer())
                .get('/store')
                .query({ location: '강남' });

            expect(response.status).toBe(200);
            for (const store of response.body) {
                expect(store).toBeDefined();
                expect(store).toHaveProperty('id');
                expect(store).toHaveProperty('name');
                expect(store).toHaveProperty('location');
                expect(store).toHaveProperty('reviewCount');
                expect(store.location).toBe('강남');
            }
        });
    });

    describe('GET /store/{storeId}', () => {
        it('특정 매장 정보를 조회한다.', async () => {
            const response = await request(app.getHttpServer())
                .get('/store/1');

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('id');
            expect(response.body).toHaveProperty('name');
            expect(response.body).toHaveProperty('location');
            expect(response.body).toHaveProperty('address');
            expect(response.body).toHaveProperty('phoneNo');
            expect(response.body).toHaveProperty('homepageUrl');
            expect(response.body).toHaveProperty('reviewCount');
            for (const theme of response.body.themes) {
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
        it('존재하지 않는 매장 정보를 조회하면 404 에러가 발생한다.', async () => {
            const response = await request(app.getHttpServer())
                .get('/store/5');

            expect(response.status).toBe(404);
        });
    });

    afterAll(async () => {
        await app.close();
    })
})