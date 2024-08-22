import { INestApplication } from '@nestjs/common';
import { UserService } from '../application/user.service';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { USER_REPOSITORY } from '../../common/inject.constant';
import { TestUserRepository } from '../infrastructure/testUser.repository';
import { SignUpRequestDto } from '../application/dto/signUp.request.dto';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { SignInRequestDto } from '../application/dto/signIn.request.dto';
import { DataSource } from 'typeorm';
import * as request from 'supertest';

describe('UserService', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let userService: UserService;
  let userRepository: TestUserRepository;

  beforeAll(async () => {
    initializeTransactionalContext();

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(USER_REPOSITORY)
      .useClass(TestUserRepository)
      .compile();

    dataSource = moduleRef.get<DataSource>(DataSource);
    userService = moduleRef.get<UserService>(UserService);
    userRepository = moduleRef.get<TestUserRepository>(USER_REPOSITORY);

    app = moduleRef.createNestApplication();
    await app.init();
  });

  beforeEach(async () => {
    await dataSource.dropDatabase();
    await dataSource.synchronize();
  });

  describe('()', () => {
    beforeEach(() => {
      userRepository.reset();
    });

    it('회원가입을 한다.', async () => {
      const signUpRequestDto = new SignUpRequestDto();
      signUpRequestDto.email = 'test@test.com';
      signUpRequestDto.password = 'testing';
      signUpRequestDto.nickname = 'test';

      const result = await userService.signUp(signUpRequestDto);

      expect(result).toEqual({
        userId: 1,
        userEmail: 'test@test.com',
        userNickname: 'test',
      });
    });
  });

  describe('()', () => {
    beforeEach(async () => {
      userRepository.reset();
      await request(app.getHttpServer()).post('/user/signUp').send({
        email: 'test@test.com',
        password: 'test1234',
        nickname: 'tester',
      });
    });

    it('로그인을 한다.', async () => {
      const signInRequestDto = new SignInRequestDto();
      signInRequestDto.email = 'test@test.com';
      signInRequestDto.password = 'test1234';

      const result = await userService.signIn(signInRequestDto);

      expect(result).toEqual({
        accessToken: expect.any(String),
      });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
