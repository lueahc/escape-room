import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve('.local.env') });
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from "@nestjs/common";
import { AppModule } from "../../app.module";
import { DataSource } from 'typeorm';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { LocationEnum } from '../../store/location.enum';
import { ThemeRepository } from '../../theme/domain/theme.repository';
import { StoreRepository } from '../../store/domain/store.repository';
import { RECORD_REPOSITORY, REVIEW_REPOSITORY, STORE_REPOSITORY, THEME_REPOSITORY, USER_REPOSITORY } from '../../common/inject.constant';
import { Store } from '../../store/domain/store.entity';
import { Theme } from '../../theme/domain/theme.entity';
import { ReviewRepository } from '../domain/review.repository';
import { User } from '../../user/domain/user.entity';
import { UserRepository } from '../../user/domain/user.repository';
import { RecordRepository } from '../../record/domain/record.repository';
import { Record } from '../../record/domain/record.entity';
import { Review } from '../domain/review.entity';
import { Tag } from '../../record/domain/tag.entity';

describe('ReviewRepository', () => {
    let app: INestApplication;
    let dataSource: DataSource;
    let themeRepository: ThemeRepository;
    let storeRepository: StoreRepository;
    let reviewRepository: ReviewRepository;
    let userRepository: UserRepository;
    let recordRepository: RecordRepository;
    let store: Store, theme: Theme, user: User, record: Record;

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
        userRepository = moduleRef.get<UserRepository>(USER_REPOSITORY);
        recordRepository = moduleRef.get<RecordRepository>(RECORD_REPOSITORY);
    });

    beforeEach(async () => {
        await dataSource.dropDatabase();
        await dataSource.synchronize();

        store = await storeRepository.save(new Store({
            name: 'test store1 name',
            location: LocationEnum.KANGNAM,
            address: 'test store address',
            phoneNo: 'test store phoneNo',
            homepageUrl: 'test store homepageUrl'
        }));
        theme = await themeRepository.save(new Theme({
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
        user = await userRepository.save(await User.create({
            email: 'test@test.com',
            password: 'test1234',
            nickname: 'tester'
        }));
        record = await recordRepository.save(await Record.create({
            user,
            theme,
            isSuccess: true,
            playDate: new Date('2024-01-01'),
            headCount: 4,
            hintCount: 1,
            playTime: 60,
            image: '',
            note: ''
        }));
        await recordRepository.saveTag(await Tag.create({
            user,
            record,
            isWriter: true
        }));
    });

    describe('save()', () => {
        it('리뷰 엔티티를 저장한다.', async () => {
            const review = await reviewRepository.save(await Review.create({
                user,
                record,
                content: 'content',
                rate: 5,
                activity: 5,
                story: 5,
                dramatic: 5,
                volume: 5,
                problem: 5,
                difficulty: 5,
                horror: 5,
                interior: 5
            }));

            const foundReview = await reviewRepository.findOneById(review.getId());
            expect(foundReview).toBeDefined();
            expect(foundReview?.getId()).toBeDefined();
            expect(foundReview?.getId()).toBe(review.getId());
        });
    });

    describe('softDelete()', () => {
        it('리뷰를 소프트 삭제한다.', async () => {
            const review = await reviewRepository.save(await Review.create({
                user,
                record,
                content: 'content',
                rate: 5,
                activity: 5,
                story: 5,
                dramatic: 5,
                volume: 5,
                problem: 5,
                difficulty: 5,
                horror: 5,
                interior: 5
            }));
            await reviewRepository.softDelete(review.getId());

            const deletedReview = await reviewRepository.findOneById(review.getId());
            expect(deletedReview).toBeNull();
        });
    });

    describe('findOne()', () => {
        let review: Review;
        beforeEach(async () => {
            review = await reviewRepository.save(await Review.create({
                user,
                record,
                content: 'content',
                rate: 5,
                activity: 5,
                story: 5,
                dramatic: 5,
                volume: 5,
                problem: 5,
                difficulty: 5,
                horror: 5,
                interior: 5
            }));
        });

        it('id로 리뷰를 찾는다.', async () => {
            const result = await reviewRepository.findOneById(review.getId());
            expect(result?.getId()).toBe(review.getId());
        });

        it('userId와 recordId로 리뷰를 찾는다.', async () => {
            const userId = review.getWriter().getId();
            const recordId = review.getRecord().getId();
            const result = await reviewRepository.findOneByUserIdAndRecordId(userId, recordId);
            expect(result?.getId()).toBe(review.getId());
        });
    });

    describe('countReviewsIn()', () => {
        beforeEach(async () => {
            await reviewRepository.save(await Review.create({
                user,
                record,
                content: 'content',
                rate: 5,
                activity: 5,
                story: 5,
                dramatic: 5,
                volume: 5,
                problem: 5,
                difficulty: 5,
                horror: 5,
                interior: 5
            }));
        });

        it('기록의 리뷰 개수를 반환한다.', async () => {
            const result = await reviewRepository.countReviewsInRecord(record.getId());
            expect(result).toBe(1);
        });

        it('테마의 공개 리뷰 개수를 반환한다.', async () => {
            const result = await reviewRepository.countVisibleReviewsInTheme(theme.getId());
            expect(result).toBe(1);
        });

        it('매장의 공개 리뷰 개수를 반환한다.', async () => {
            const result = await reviewRepository.countVisibleReviewsInStore(store.getId());
            expect(result).toBe(1);
        });
    });

    describe('getVisibleReviewsInTheme()', () => {
        it('테마의 공개 리뷰 전체를 반환한다.', async () => {
            await reviewRepository.save(await Review.create({
                user,
                record,
                content: 'content',
                rate: 5,
                activity: 5,
                story: 5,
                dramatic: 5,
                volume: 5,
                problem: 5,
                difficulty: 5,
                horror: 5,
                interior: 5
            }));

            const result = await reviewRepository.getVisibleReviewsInTheme(theme.getId());
            expect(result[0]).toMatchObject({
                content: 'content',
                rate: 5,
                activity: 5,
                story: 5,
                dramatic: 5,
                volume: 5,
                problem: 5,
                difficulty: 5,
                horror: 5,
                interior: 5,
            });
        });

        it('데이터가 존재하지 않으면 빈 배열을 반환한다.', async () => {
            const result = await reviewRepository.getVisibleReviewsInTheme(theme.getId());
            expect(result).toEqual([]);
        });
    });

    afterAll(async () => {
        await app.close();
    });
})