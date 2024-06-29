import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve('.local.env') });
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from "@nestjs/common";
import { AppModule } from "../../app.module";
import { DataSource } from 'typeorm';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { Theme } from '../domain/theme.entity';
import { Store } from '../../store/domain/store.entity';
import { LocationEnum } from '../../store/location.enum';
import { ThemeRepository } from '../domain/theme.repository';
import { StoreRepository } from '../../store/domain/store.repository';
import { STORE_REPOSITORY, THEME_REPOSITORY } from '../../common/inject.constant';

describe('RecordRepository', () => {
    let app: INestApplication;
    let dataSource: DataSource;
    let themeRepository: ThemeRepository;
    let storeRepository: StoreRepository;
    let store: Store;

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

        store = new Store({
            name: 'test store name',
            location: LocationEnum.KANGNAM,
            address: 'test store address',
            phoneNo: 'test store phoneNo',
            homepageUrl: 'test store homepageUrl'
        });
        await storeRepository.save(store);
    });

    describe('save()', () => {
        it('테마 엔티티를 저장한다.', async () => {
            const theme = new Theme({
                name: 'test theme name',
                image: 'test theme image',
                plot: 'test theme plot',
                genre: 'test theme genre',
                time: 70,
                level: 1,
                price: 27000,
                note: 'test theme note',
                store: store
            });
            await themeRepository.save(theme);

            const foundTheme = await themeRepository.findOneById(theme.getId());
            expect(foundTheme).toBeDefined();
            expect(foundTheme?.getId()).toBeDefined();
            expect(foundTheme?.getName()).toBe(theme.getName());
        });
    });

    describe('findOneById()', () => {
        it('id로 테마를 찾는다.', async () => {
            const savedTheme = await themeRepository.save(new Theme({
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

            const result = await themeRepository.findOneById(1);
            expect(result?.getName()).toEqual(savedTheme.getName());
        });
    });

    describe('find()', () => {
        let savedTheme1: Theme, savedTheme2: Theme;
        beforeEach(async () => {
            savedTheme1 = await themeRepository.save(new Theme({
                name: 'test theme1 name',
                image: 'test theme1 image',
                plot: 'test theme1 plot',
                genre: 'test theme1 genre',
                time: 70,
                level: 1,
                price: 27000,
                note: 'test theme1 note',
                store: store
            }));
            savedTheme2 = await themeRepository.save(new Theme({
                name: 'test theme2 name',
                image: 'test theme2 image',
                plot: 'test theme2 plot',
                genre: 'test theme2 genre',
                time: 70,
                level: 1,
                price: 27000,
                note: 'test theme2 note',
                store: store
            }));
        });

        it('전체 테마를 조회한다.', async () => {
            const result = await themeRepository.findAll();
            expect(result).toEqual([savedTheme1, savedTheme2]);
        });

        it('특정 지역으로 전체 테마를 조회한다.', async () => {
            const result = await themeRepository.findByLocation(LocationEnum.KANGNAM);
            expect(result).toEqual([savedTheme1, savedTheme2]);
        });

        it('특정 키워드로 전체 테마를 조회한다.', async () => {
            const result = await themeRepository.findByKeyword('theme1');
            expect(result).toEqual([savedTheme1]);
        });

        it('특정 매장id로 전체 테마를 조회한다.', async () => {
            const result = await themeRepository.findByStoreId(1);
            expect(result).toEqual([savedTheme1, savedTheme2]);
        });
    });

    afterAll(async () => {
        await app.close();
    });
})