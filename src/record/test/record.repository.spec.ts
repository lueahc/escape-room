import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({
    path: path.resolve('.local.env')
});
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from "@nestjs/common";
import { AppModule } from "../../app.module";
import { DataSource, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { Record } from '../record.entity';
import { Tag } from '../tag.entity';
import { Theme } from '../../theme/theme.entity';
import { Store } from '../../store/store.entity';
import { User } from '../../user/user.entity';
import { LocationEnum } from '../../store/location.enum';
import { RecordPartial } from '../record.types';
import { Review } from '../../review/review.entity';

describe('RecordRepository', () => {
    let app: INestApplication;
    let dataSource: DataSource;
    let recordRepository: Repository<Record>;
    let tagRepository: Repository<Tag>;
    let themeRepository: Repository<Theme>;
    let storeRepository: Repository<Store>;
    let userRepository: Repository<User>;
    let reviewRepository: Repository<Review>

    beforeAll(async () => {
        initializeTransactionalContext();

        const moduleRef: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        dataSource = moduleRef.get<DataSource>(DataSource);

        const recordRepositoryToken = getRepositoryToken(Record);
        recordRepository = moduleRef.get<Repository<Record>>(recordRepositoryToken);
        const tagRepositoryToken = getRepositoryToken(Tag);
        tagRepository = moduleRef.get<Repository<Tag>>(tagRepositoryToken);
        const themeRepositoryToken = getRepositoryToken(Theme);
        themeRepository = moduleRef.get<Repository<Theme>>(themeRepositoryToken);
        const storeRepositoryToken = getRepositoryToken(Store);
        storeRepository = moduleRef.get<Repository<Store>>(storeRepositoryToken);
        const userRepositoryToken = getRepositoryToken(User);
        userRepository = moduleRef.get<Repository<User>>(userRepositoryToken);
        const reviewRepositoryToken = getRepositoryToken(Review);
        reviewRepository = moduleRef.get<Repository<Review>>(reviewRepositoryToken);
        ;
        app = moduleRef.createNestApplication();
        await app.init();
    });

    beforeEach(async () => {
        await dataSource.dropDatabase();
        await dataSource.synchronize();
    });

    describe('findOne record', () => {
        it('id로 기록을 찾는다.', async () => {
            const user = new User();
            user.email = 'test@test.com';
            user.password = 'test1234';
            user.nickname = 'tester';
            const savedUser = await userRepository.save(user);

            const store1 = storeRepository.create({
                name: "test store1 name",
                location: LocationEnum.KANGNAM,
                address: "test store1 address",
                phoneNo: "test store1 phoneNo",
                homepageUrl: "test store1 homepageUrl"
            });
            await storeRepository.save(store1);

            const savedTheme = await themeRepository.save({
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

            const record = await recordRepository.save({
                writer: savedUser,
                theme: savedTheme,
                isSuccess: true,
                playDate: "2024-01-01",
                headCount: 4,
            });

            const result = await recordRepository.findOne({
                relations: {
                    writer: true
                },
                where: {
                    id: 1
                }
            });

            if (result) {
                expect(result.id).toEqual(record.id);
                expect(result.writer.id).toEqual(record.writer.id);
            } else {
                expect(result).not.toBeNull();
            }
        });

        // it('id로 기록을 찾는다.', async () => {
        //     const result = await recordRepository.findOne({
        //         select: {
        //             id: true,
        //             writer: {
        //                 id: true,
        //                 nickname: true,
        //             },
        //             theme: {
        //                 id: true,
        //                 name: true,
        //                 store: {
        //                     id: true,
        //                     name: true
        //                 }
        //             },
        //             playDate: true,
        //             isSuccess: true,
        //             headCount: true,
        //             hintCount: true,
        //             playTime: true,
        //             image: true,
        //             note: true,
        //             reviews: {
        //                 id: true,
        //                 writer: {
        //                     id: true,
        //                     nickname: true
        //                 },
        //                 content: true,
        //                 rate: true,
        //                 activity: true,
        //                 story: true,
        //                 dramatic: true,
        //                 volume: true,
        //                 problem: true,
        //                 difficulty: true,
        //                 horror: true,
        //                 interior: true,
        //             }
        //         },
        //         relations: {
        //             writer: true,
        //             theme: {
        //                 store: true
        //             },
        //             reviews: {
        //                 writer: true
        //             }
        //         },
        //         where: {
        //             id: 1
        //         }
        //     });
        // });

        // it('id로 기록을 찾는다.', async () => {
        //     const result = await recordRepository.findOne({
        //         where: { id: 1 },
        //         relations: ['writer', 'theme', 'theme.store']
        //     });
        // })

        it('데이터가 존재하지 않으면 null을 반환한다.', async () => {
            const result = await recordRepository.findOne({
                relations: {
                    writer: true
                },
                where: {
                    id: 1
                }
            });

            expect(result).toBeNull();
        });
    });

    describe('find records', () => {
        it('전체 기록을 조회한다.', async () => {
            const user = new User();
            user.email = 'test@test.com';
            user.password = 'test1234';
            user.nickname = 'tester';
            const savedUser = await userRepository.save(user);

            const store1 = storeRepository.create({
                name: "test store1 name",
                location: LocationEnum.KANGNAM,
                address: "test store1 address",
                phoneNo: "test store1 phoneNo",
                homepageUrl: "test store1 homepageUrl"
            });
            await storeRepository.save(store1);

            const savedTheme = await themeRepository.save({
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

            const record = await recordRepository.save({
                writer: savedUser,
                theme: savedTheme,
                isSuccess: true,
                playDate: "2024-01-01",
                headCount: 4,
            });

            const tag = await tagRepository.save({
                user: savedUser,
                record,
                isWriter: true
            })

            const whereConditions: RecordPartial = {
                tags: {
                    visibility: true,
                    user: {
                        id: 1
                    }
                }
            };

            const result = await recordRepository.find({
                select: {
                    id: true,
                    writer: {
                        id: true,
                        nickname: true,
                    },
                    theme: {
                        id: true,
                        name: true,
                        store: {
                            id: true,
                            name: true
                        }
                    },
                    playDate: true,
                    isSuccess: true,
                    headCount: true,
                    hintCount: true,
                    playTime: true,
                    image: true,
                    note: true,
                    reviews: {
                        id: true,
                        writer: {
                            id: true,
                            nickname: true
                        },
                        content: true,
                        rate: true,
                        activity: true,
                        story: true,
                        dramatic: true,
                        volume: true,
                        problem: true,
                        difficulty: true,
                        horror: true,
                        interior: true,
                    }
                },
                relations: {
                    writer: true,
                    theme: {
                        store: true
                    },
                    reviews: {
                        writer: true
                    }
                },
                where: whereConditions,
                order: {
                    id: 'DESC'
                }
            });

            expect(result).toEqual(expect.arrayContaining([
                expect.objectContaining({
                    id: expect.any(Number),
                    writer: expect.objectContaining({
                        id: expect.any(Number),
                        nickname: expect.any(String),
                    }),
                    theme: expect.objectContaining({
                        id: expect.any(Number),
                        name: expect.any(String),
                        store: expect.objectContaining({
                            id: expect.any(Number),
                            name: expect.any(String),
                        })
                    }),
                    playDate: expect.any(Date),
                    isSuccess: expect.any(Boolean),
                    headCount: expect.any(Number),
                })
            ]));
        });
    });

    describe('find records by createQueryBuilder', () => {
        it('query builder로 전체 기록을 조회한다.', async () => {
            const user = new User();
            user.email = 'test@test.com';
            user.password = 'test1234';
            user.nickname = 'tester';
            const savedUser = await userRepository.save(user);

            const store1 = storeRepository.create({
                name: "test store1 name",
                location: LocationEnum.KANGNAM,
                address: "test store1 address",
                phoneNo: "test store1 phoneNo",
                homepageUrl: "test store1 homepageUrl"
            });
            await storeRepository.save(store1);

            const savedTheme = await themeRepository.save({
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

            const record = await recordRepository.save({
                writer: savedUser,
                theme: savedTheme,
                isSuccess: true,
                playDate: "2024-01-01",
                headCount: 4,
            });

            const tag = await tagRepository.save({
                user: savedUser,
                record,
                isWriter: true
            })

            const result = await recordRepository.createQueryBuilder('r')
                .leftJoin('theme', 't', 'r.theme_id = t.id')
                .leftJoin('store', 's', 't.store_id = s.id')
                .leftJoin('tag', 't2', 't2.record_id = r.id')
                .addSelect('r.id', 'id')
                .addSelect('r.playDate', 'play_date')
                .addSelect('s.name', 'store_name')
                .addSelect('t.name', 'theme_name')
                .addSelect('r.isSuccess', 'is_success')
                .where('r.writer_id = :userId and t2.isWriter = true and t2.visibility = true', { userId: 1 })
                .orWhere('t2.user_id = :userId and t2.isWriter = false and t2.visibility = true', { userId: 1 })
                .orderBy('play_date', 'DESC')
                .getRawMany();

            expect(result).toEqual(expect.arrayContaining([
                expect.objectContaining({
                    id: expect.any(Number),
                    play_date: expect.any(Date),
                    store_name: expect.any(String),
                    theme_name: expect.any(String),
                    is_success: expect.any(Number),
                })
            ]));
        });

        it('데이터가 존재하지 않으면 빈 배열을 반환한다.', async () => {
            const result = await recordRepository.createQueryBuilder('r')
                .leftJoin('theme', 't', 'r.theme_id = t.id')
                .leftJoin('store', 's', 't.store_id = s.id')
                .leftJoin('tag', 't2', 't2.record_id = r.id')
                .addSelect('r.id', 'id')
                .addSelect('r.playDate', 'play_date')
                .addSelect('s.name', 'store_name')
                .addSelect('t.name', 'theme_name')
                .addSelect('r.isSuccess', 'is_success')
                .where('r.writer_id = :userId and t2.isWriter = true and t2.visibility = true', { userId: 1 })
                .orWhere('t2.user_id = :userId and t2.isWriter = false and t2.visibility = true', { userId: 1 })
                .orderBy('play_date', 'DESC')
                .getRawMany();

            expect(result).toEqual([]);
        });
    });

    describe('create record', () => {
        it('기록 엔티티를 생성한다.', async () => {
            const user = new User();
            user.email = 'test@test.com';
            user.password = 'test1234';
            user.nickname = 'tester';
            const savedUser = await userRepository.save(user);

            const store1 = storeRepository.create({
                name: "test store1 name",
                location: LocationEnum.KANGNAM,
                address: "test store1 address",
                phoneNo: "test store1 phoneNo",
                homepageUrl: "test store1 homepageUrl"
            });
            await storeRepository.save(store1);

            const savedTheme = await themeRepository.save({
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

            const record = recordRepository.create({
                writer: savedUser,
                theme: savedTheme,
                isSuccess: true,
                playDate: "2024-01-01",
                headCount: 4,
            });

            expect(record).toBeInstanceOf(Record);
        });
    });

    describe('save record', () => {
        it('기록 엔티티를 저장한다.', async () => {
            const user = new User();
            user.email = 'test@test.com';
            user.password = 'test1234';
            user.nickname = 'tester';
            const savedUser = await userRepository.save(user);

            const store1 = storeRepository.create({
                name: "test store1 name",
                location: LocationEnum.KANGNAM,
                address: "test store1 address",
                phoneNo: "test store1 phoneNo",
                homepageUrl: "test store1 homepageUrl"
            });
            await storeRepository.save(store1);

            const savedTheme = await themeRepository.save({
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

            const record = await recordRepository.save({
                writer: savedUser,
                theme: savedTheme,
                isSuccess: true,
                playDate: "2024-01-01",
                headCount: 4,
            });

            const foundrecord = await recordRepository.findOne({ where: { id: record.id } });

            expect(foundrecord).toBeDefined();
        });
    });

    describe('softDelete record', () => {
        it('기록을 소프트 삭제한다.', async () => {
            const user = new User();
            user.email = 'test@test.com';
            user.password = 'test1234';
            user.nickname = 'tester';
            const savedUser = await userRepository.save(user);

            const store1 = storeRepository.create({
                name: "test store1 name",
                location: LocationEnum.KANGNAM,
                address: "test store1 address",
                phoneNo: "test store1 phoneNo",
                homepageUrl: "test store1 homepageUrl"
            });
            await storeRepository.save(store1);

            const savedTheme = await themeRepository.save({
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

            const record = await recordRepository.save({
                writer: savedUser,
                theme: savedTheme,
                isSuccess: true,
                playDate: "2024-01-01",
                headCount: 4,
            });

            await reviewRepository.save({
                user: savedUser,
                record
            });

            await recordRepository.softDelete({ id: record.id });

            const deletedRecord = await recordRepository.findOne({ withDeleted: true, where: { id: record.id } });

            if (deletedRecord) {
                expect(deletedRecord.deletedAt).not.toBeNull();
                const relatedReviews = await reviewRepository.find({ where: { record: record } });
                expect(relatedReviews.length).toBe(0);
            } else {
                expect(deletedRecord).not.toBeNull();
            }
        });
    });

    // describe('findOne tag', () => {
    //     it('', async () => {
    //         const result = await tagRepository.findOne({
    //             relations: {
    //                 user: true,
    //                 record: true
    //             },
    //             where: {
    //                 user: {
    //                     id: userId
    //                 },
    //                 record: {
    //                     id: recordId
    //                 }
    //             }
    //         });
    //     });
    // });

    // describe('find tags', () => {
    //     it('', async () => {
    //         const result = await tagRepository.find({
    //             select: {
    //                 user: {
    //                     id: true
    //                 }
    //             },
    //             relations: {
    //                 user: true,
    //             },
    //             where: {
    //                 record: {
    //                     id: recordId
    //                 }
    //             }
    //         });
    //     });

    //     it('', async () => {
    //         await tagRepository.find({
    //             select: {
    //                 user: {
    //                     nickname: true,
    //                 }
    //             },
    //             relations: {
    //                 user: true,
    //             },
    //             where: {
    //                 user: {
    //                     id: Not(userId)
    //                 },
    //                 record: {
    //                     id: recordId
    //                 }
    //             }
    //         });
    //     })
    // });

    // describe('create tag', () => {
    //     it('', async () => {
    //         const result = tagRepository.create({
    //             user,
    //             record,
    //             isWriter: true
    //         });
    //     });
    // });

    // describe('save tag', () => {
    //     it('', async () => {
    //         await tagRepository.save(tag);
    //     });

    // });

    // describe('softDelete tag', () => {
    //     it('', async () => {
    //         await tagRepository.softDelete({ id: 1 });
    //     });


    // });

    afterAll(async () => {
        await app.close();
    });
})