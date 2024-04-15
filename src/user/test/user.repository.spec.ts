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
import { User } from '../user.entity';

describe('RecordRepository', () => {
    let app: INestApplication;
    let dataSource: DataSource;
    let userRepository: Repository<User>;

    beforeAll(async () => {
        initializeTransactionalContext();

        const moduleRef: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        dataSource = moduleRef.get<DataSource>(DataSource);

        const userRepositoryToken = getRepositoryToken(User);
        userRepository = moduleRef.get<Repository<User>>(userRepositoryToken);

        app = moduleRef.createNestApplication();
        await app.init();
    });

    beforeEach(async () => {
        await dataSource.dropDatabase();
        await dataSource.synchronize();
    });

    describe('findOne user', () => {
        let savedUser;

        beforeEach(async () => {
            const user = new User();
            user.email = 'test@test.com';
            user.password = 'test1234';
            user.nickname = 'tester';
            savedUser = await userRepository.save(user);
        });

        it('id로 사용자를 찾는다.', async () => {
            const result = await userRepository.findOne({
                where: {
                    id: 1
                },
            });

            expect(result).toEqual(savedUser);
        });

        it('이메일로 사용자를 찾는다.', async () => {
            const result = await userRepository.findOne({
                where: {
                    email: 'test@test.com'
                },
            });

            expect(result).toEqual(savedUser);
        });

        it('닉네임으로 사용자를 찾는다.', async () => {
            const result = await userRepository.findOne({
                where: {
                    nickname: 'tester'
                },
            });

            expect(result).toEqual(savedUser);
        });
    });

    describe('create user', () => {
        it('사용자 엔티티를 생성한다.', async () => {
            const user = userRepository.create({
                email: 'test@test.com',
                password: 'test1234',
                nickname: 'tester'
            });

            expect(user).toBeInstanceOf(User);
        });
    });

    describe('save user', () => {
        it('사용자 엔티티를 저장한다.', async () => {
            const user = new User();
            user.email = 'test@test.com';
            user.password = 'test1234';
            user.nickname = 'tester';
            await userRepository.save(user);

            const foundUser = await userRepository.findOne({ where: { id: user.id } });

            expect(foundUser).toBeDefined();
            // expect(foundUser.id).toBeDefined();
            // expect(foundUser.email).toBe(user.email);
            // expect(foundUser.password).toBe(user.password);
            // expect(foundUser.nickname).toBe(user.nickname);
        });
    });

    afterAll(async () => {
        await app.close();
    });
})