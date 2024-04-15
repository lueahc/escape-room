import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({
    path: path.resolve('.local.env')
});
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from "@nestjs/common";
import { AppModule } from "../../app.module";
import { DataSource, Like, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { Store } from '../../store/store.entity';
import { LocationEnum } from '../../store/location.enum';
import { Theme } from '../../theme/theme.entity';

describe('RecordRepository', () => {
    let app: INestApplication;
    let dataSource: DataSource;
    let themeRepository: Repository<Theme>;
    let storeRepository: Repository<Store>;

    beforeAll(async () => {
        initializeTransactionalContext();

        const moduleRef: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        dataSource = moduleRef.get<DataSource>(DataSource);

        const themeRepositoryToken = getRepositoryToken(Theme);
        themeRepository = moduleRef.get<Repository<Theme>>(themeRepositoryToken);
        const storeRepositoryToken = getRepositoryToken(Store);
        storeRepository = moduleRef.get<Repository<Store>>(storeRepositoryToken);

        app = moduleRef.createNestApplication();
        await app.init();
    });

    beforeEach(async () => {
        await dataSource.dropDatabase();
        await dataSource.synchronize();
    });

    describe('findOne store', () => {
        it('id로 매장을 찾는다.', async () => {
            const store = await storeRepository.save({
                name: "test store1 name",
                location: LocationEnum.KANGNAM,
                address: "test store1 address",
                phoneNo: "test store1 phoneNo",
                homepageUrl: "test store1 homepageUrl"
            });

            const result = await storeRepository.findOne({
                where: {
                    id: 1
                }
            });

            expect(result).toMatchObject(store);
        });
    });

    describe('find stores', () => {
        let store1, store2;

        beforeEach(async () => {
            await dataSource.dropDatabase();
            await dataSource.synchronize();

            store1 = storeRepository.create({
                name: "test store1 name",
                location: LocationEnum.KANGNAM,
                address: "test store1 address",
                phoneNo: "test store1 phoneNo",
                homepageUrl: "test store1 homepageUrl"
            });
            await storeRepository.save(store1);

            await themeRepository.save({
                name: "test theme1 name",
                image: "test theme1 image",
                plot: "test theme1 plot",
                genre: "test theme1 genre",
                time: 70,
                level: 1,
                price: 27000,
                note: "test theme1 note",
                store: store1
            });
            await themeRepository.save({
                name: "test theme2 name",
                image: "test theme2 image",
                plot: "test theme2 plot",
                genre: "test theme2 genre",
                time: 70,
                level: 1,
                price: 27000,
                note: "test theme2 note",
                store: store1
            });

            store2 = storeRepository.create({
                name: "test store2 name",
                location: LocationEnum.HONGDAE,
                address: "test store2 address",
                phoneNo: "test store2 phoneNo",
                homepageUrl: "test store2 homepageUrl"
            });
            await storeRepository.save(store2);

            await themeRepository.save({
                name: "test theme3 name",
                image: "test theme3 image",
                plot: "test theme3 plot",
                genre: "test theme3 genre",
                time: 70,
                level: 1,
                price: 27000,
                note: "test theme3 note",
                store: store2
            });
            await themeRepository.save({
                name: "test theme4 name",
                image: "test theme4 image",
                plot: "test theme4 plot",
                genre: "test theme4 genre",
                time: 70,
                level: 1,
                price: 27000,
                note: "test theme4 note",
                store: store2
            });
        });

        it('전체 매장을 조회한다.', async () => {
            const result = await storeRepository.find({
                order: {
                    id: 'DESC'
                }
            });

            const sortedA = [...result].sort();
            const sortedB = [...[store1, store2]].sort().reverse();

            expect(sortedA).toEqual(sortedB);
        });

        it('특정 지역으로 전체 매장을 조회한다.', async () => {
            const result = await storeRepository.find({
                where: {
                    location: LocationEnum.KANGNAM
                },
                order: {
                    id: 'DESC'
                }
            });

            expect(result).toEqual([store1]);
        });

        it('특정 키워드로 전체 매장을 조회한다.', async () => {
            const keyword = 'store1';
            const result = await storeRepository.find({
                relations: {
                    themes: true
                },
                where: {
                    name: Like(`%${keyword}%`)
                }
            });

            expect(result).toMatchObject([store1]);
        });
    });

    afterAll(async () => {
        await app.close();
    });
})