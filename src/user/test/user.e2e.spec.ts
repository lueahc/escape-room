import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve('.local.env') });
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from "@nestjs/common";
import { AppModule } from "../../app.module";
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { UserRepository } from '../domain/user.repository';
import { USER_REPOSITORY } from '../../common/inject.constant';

describe('UserController (E2E)', () => {
    let app: INestApplication;
    let dataSource: DataSource;
    let userRepository: UserRepository;

    beforeAll(async () => {
        initializeTransactionalContext();

        const moduleRef: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleRef.createNestApplication();
        await app.init();

        dataSource = moduleRef.get<DataSource>(DataSource);
        userRepository = moduleRef.get<UserRepository>(USER_REPOSITORY);
    });

    beforeEach(async () => {
        await dataSource.dropDatabase();
        await dataSource.synchronize();
    });

    describe('POST /user/signUp', () => {
        it('사용자를 생성한다.', async () => {
            // given: 테스트 전 필요한 데이터와 환경 세팅

            // when: 실행
            const response = await request(app.getHttpServer())
                .post('/user/signUp')
                .send({
                    email: 'test@test.com',
                    password: 'test1234',
                    nickname: 'tester'
                });

            // then: 결과와 기대값 비교
            expect(response.status).toBe(201);
            const user = await userRepository.findOneByEmail("test@test.com");
            expect(user).toBeDefined();
        });

        it('이미 존재하는 이메일이면 409 에러가 발생한다.', async () => {
            // given
            await request(app.getHttpServer())
                .post('/user/signUp')
                .send({
                    email: 'test@test.com',
                    password: 'test1234',
                    nickname: 'tester1'
                });

            // when
            const response = await request(app.getHttpServer())
                .post('/user/signUp')
                .send({
                    email: 'test@test.com',
                    password: 'test1234',
                    nickname: 'tester2'
                });

            // then
            expect(response.status).toBe(409);
        });

        it('이미 존재하는 닉네임이면 409 에러가 발생한다.', async () => {
            // given
            await request(app.getHttpServer())
                .post('/user/signUp')
                .send({
                    email: 'test1@test.com',
                    password: 'test1234',
                    nickname: 'tester'
                });

            // when
            const response = await request(app.getHttpServer())
                .post('/user/signUp')
                .send({
                    email: 'test2@test.com',
                    password: 'test1234',
                    nickname: 'tester'
                });

            // then
            expect(response.status).toBe(409);
        });
    });

    describe('POST /user/signIn', () => {
        beforeEach(async () => {
            await request(app.getHttpServer())
                .post('/user/signUp')
                .send({
                    email: 'test1@test.com',
                    password: 'test1234',
                    nickname: 'tester1'
                });
        });

        it('로그인에 성공한다.', async () => {
            const response = await request(app.getHttpServer())
                .post('/user/signIn')
                .send({
                    email: 'test1@test.com',
                    password: 'test1234'
                });

            expect(response.status).toBe(200);
            expect(response.body.accessToken).toBeDefined();
        });

        it('존재하지 않는 사용자가 요청하면 404 에러가 발생한다.', async () => {
            const response = await request(app.getHttpServer())
                .post('/user/signIn')
                .send({
                    email: 'test2@test.com',
                    password: 'test1234'
                });

            expect(response.status).toBe(404);
        });

        it('비밀번호가 일치하지 않으면 400 에러가 발생한다.', async () => {
            const response = await request(app.getHttpServer())
                .post('/user/signIn')
                .send({
                    email: 'test1@test.com',
                    password: 'test12345'
                });

            expect(response.status).toBe(400);
        });
    });
    describe('PATCH /user/info', () => {
        beforeEach(async () => {
            await request(app.getHttpServer())
                .post('/user/signUp')
                .send({
                    email: 'test1@test.com',
                    password: 'test1234',
                    nickname: 'tester1'
                });
        });

        it('사용자의 정보를 수정한다.', async () => {
            const loginResponse = await request(app.getHttpServer())
                .post('/user/signIn')
                .send({
                    email: 'test1@test.com',
                    password: 'test1234'
                });
            const accessToken = loginResponse.body.accessToken;

            const response = await request(app.getHttpServer())
                .patch('/user/info')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    password: 'test12345',
                    nickname: 'tester2'
                });

            const updatedResponse = await request(app.getHttpServer())
                .post('/user/signIn')
                .send({
                    email: 'test1@test.com',
                    password: 'test12345'
                });

            expect(response.status).toBe(204);
            expect(updatedResponse.status).toBe(200);
            const user = await userRepository.findOneByEmail("test1@test.com");
            expect(user?.getNickname()).toBe("tester2");

        });

        it('이미 존재하는 닉네임이면 409 에러가 발생한다.', async () => {
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
                    email: 'test1@test.com',
                    password: 'test1234'
                });
            const accessToken = loginResponse.body.accessToken;

            const response = await request(app.getHttpServer())
                .patch('/user/info')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    nickname: 'tester2'
                });

            expect(response.status).toBe(409);
        });
    });

    describe('GET /user/search', () => {
        let accessToken: string;

        beforeEach(async () => {
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
        });

        it('닉네임으로 사용자를 검색한다.', async () => {
            await request(app.getHttpServer())
                .post('/user/signUp')
                .send({
                    email: 'test2@test.com',
                    password: 'test1234',
                    nickname: 'tester2'
                });

            const response = await request(app.getHttpServer())
                .get('/user/search')
                .set('Authorization', `Bearer ${accessToken}`)
                .query({ nickname: 'tester2' });

            expect(response.status).toBe(200);
            expect(response.body.userId).toBeDefined();
            expect(response.body.userNickname).toBeDefined();
        });

        it('존재하지 않는 사용자를 검색하면 404 에러가 발생한다.', async () => {
            const response = await request(app.getHttpServer())
                .get('/user/search')
                .set('Authorization', `Bearer ${accessToken}`)
                .query({ nickname: 'x' });

            expect(response.status).toBe(404);
        });

        it('본인이면 400 에러가 발생한다.', async () => {
            const response = await request(app.getHttpServer())
                .get('/user/search')
                .set('Authorization', `Bearer ${accessToken}`)
                .query({ nickname: 'tester1' });

            expect(response.status).toBe(400);
        });
    });

    afterAll(async () => {
        await app.close();
    })
})