import {
  BadRequestException,
  ConflictException,
  INestApplication,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from '../application/user.service';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { USER_REPOSITORY } from '../../common/inject.constant';
import { TestUserRepository } from '../infrastructure/testUser.repository';
import { SignUpRequestDto } from '../application/dto/signUp.request.dto';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { SignInRequestDto } from '../application/dto/signIn.request.dto';
import { DataSource } from 'typeorm';
import { UserRepository } from '../domain/user.repository';
import * as bcrypt from 'bcrypt';
import { User } from '../domain/user.entity';
import { UpdateInfoRequestDto } from '../application/dto/updateInfo.request.dto';

describe('UserService', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let userService: UserService;
  //let userRepository: TestUserRepository;
  let userRepository: UserRepository;

  beforeAll(async () => {
    initializeTransactionalContext();

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      // .overrideProvider(USER_REPOSITORY)
      // .useClass(TestUserRepository)
      .compile();

    dataSource = moduleRef.get<DataSource>(DataSource);
    userService = moduleRef.get<UserService>(UserService);
    //userRepository = moduleRef.get<TestUserRepository>(USER_REPOSITORY);
    userRepository = moduleRef.get<UserRepository>(USER_REPOSITORY);

    app = moduleRef.createNestApplication();
    await app.init();
  });

  beforeEach(async () => {
    await dataSource.dropDatabase();
    await dataSource.synchronize();
  });

  describe('signUp()', () => {
    it('이미 존재하는 이메일이 있을 경우 ConflictException 에러가 발생한다.', async () => {
      const signUpRequestDto: SignUpRequestDto = {
        email: 'test@test.com',
        password: 'test1234',
        nickname: 'tester',
      };

      jest
        .spyOn(userRepository, 'findOneByEmail')
        .mockResolvedValue(await User.create(signUpRequestDto));

      await expect(userService.signUp(signUpRequestDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('이미 존재하는 닉네임이 있을 경우 ConflictException 에러가 발생한다.', async () => {
      const signUpRequestDto: SignUpRequestDto = {
        email: 'test2@test.com',
        password: 'test1234',
        nickname: 'tester',
      };

      jest.spyOn(userRepository, 'findOneByEmail').mockResolvedValue(null);
      jest
        .spyOn(userRepository, 'findOneByNickname')
        .mockResolvedValue(await User.create(signUpRequestDto));

      await expect(userService.signUp(signUpRequestDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('회원가입에 성공할 경우 사용자 정보를 반환한다.', async () => {
      const signUpRequestDto: SignUpRequestDto = {
        email: 'test3@test.com',
        password: 'test1234',
        nickname: 'tester3',
      };

      jest.spyOn(userRepository, 'findOneByEmail').mockResolvedValue(null);
      jest.spyOn(userRepository, 'findOneByNickname').mockResolvedValue(null);
      jest
        .spyOn(userService, 'hashPassword')
        .mockResolvedValue('hashedPassword');

      const user = await User.create({
        email: signUpRequestDto.email,
        password: 'hashedPassword',
        nickname: signUpRequestDto.nickname,
      });

      jest.spyOn(userRepository, 'save').mockResolvedValue(user);
      jest.spyOn(user, 'getId').mockReturnValue(1);
      jest.spyOn(user, 'getEmail').mockReturnValue(signUpRequestDto.email);
      jest
        .spyOn(user, 'getNickname')
        .mockReturnValue(signUpRequestDto.nickname);
      jest.spyOn(user, 'getCreatedAt').mockReturnValue(new Date());

      const result = await userService.signUp(signUpRequestDto);

      expect(result).toEqual({
        userId: 1,
        userEmail: signUpRequestDto.email,
        userNickname: signUpRequestDto.nickname,
        createdAt: expect.any(Date),
      });
    });
  });

  describe('signIn()', () => {
    it('사용자가 존재하지 않을 경우 NotFoundException 에러가 발생한다.', async () => {
      jest.spyOn(userRepository, 'findOneByEmail').mockResolvedValue(null);
      const signInRequestDto: SignInRequestDto = {
        email: 'test@test.com',
        password: 'test1234',
      };

      await expect(userService.signIn(signInRequestDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('비밀번호가 일치하지 않을 경우 BadRequestException 에러가 발생한다.', async () => {
      const user = await User.create({
        email: 'test@test.com',
        password: 'test1234',
        nickname: 'tester',
      });
      await userRepository.save(user);
      user.getPassword = jest.fn().mockReturnValue('hashedPassword');
      jest.spyOn(userRepository, 'findOneByEmail').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => false);
      const signInRequestDto: SignInRequestDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      await expect(userService.signIn(signInRequestDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('로그인에 성공할 경우 토큰을 반환한다.', async () => {
      const user = await User.create({
        email: 'test@test.com',
        password: 'test1234',
        nickname: 'tester',
      });
      await userRepository.save(user);
      user.getPassword = jest.fn().mockReturnValue('hashedPassword');
      user.getId = jest.fn().mockReturnValue(1);
      jest.spyOn(userRepository, 'findOneByEmail').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);
      jest
        .spyOn(userService['authService'], 'signWithJwt')
        .mockReturnValue('accessToken');

      const signInRequestDto: SignInRequestDto = {
        email: 'test@test.com',
        password: 'test1234',
      };
      const result = await userService.signIn(signInRequestDto);

      expect(result).toEqual({ accessToken: 'accessToken' });
      expect(userService['authService'].signWithJwt).toHaveBeenCalledWith({
        userId: 1,
      });
    });
  });

  describe.only('updateInfo()', () => {
    it('사용자가 존재하지 않을 경우 NotFoundException 에러가 발생한다.', async () => {
      const updateInfoRequestDto: UpdateInfoRequestDto = {
        password: 'newpassword123',
        nickname: 'newnickname',
      };

      jest.spyOn(userRepository, 'findOneById').mockResolvedValue(null);

      await expect(
        userService.updateInfo(1, updateInfoRequestDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('비밀번호를 성공적으로 업데이트한다.', async () => {
      const user = await User.create({
        email: 'test@test.com',
        password: 'test1234',
        nickname: 'tester',
      });
      await userRepository.save(user);

      jest.spyOn(userRepository, 'findOneById').mockResolvedValue(user);
      jest
        .spyOn(userService, 'hashPassword')
        .mockResolvedValue('hashedPassword');
      jest.spyOn(user, 'updatePassword').mockImplementation();
      jest.spyOn(userRepository, 'save').mockResolvedValue(user);

      const updateInfoRequestDto: UpdateInfoRequestDto = {
        password: 'newpassword123',
        nickname: 'nickname',
      };

      await userService.updateInfo(1, updateInfoRequestDto);

      expect(userService.hashPassword).toHaveBeenCalledWith('newpassword123');
      expect(user.updatePassword).toHaveBeenCalledWith('hashedPassword');
      expect(userRepository.save).toHaveBeenCalledWith(user);
    });

    it('닉네임이 이미 존재하는 경우 ConflictException 에러가 발생한다.', async () => {
      const existingUser = await User.create({
        email: 'test2@test.com',
        password: 'test1234',
        nickname: 'existingnickname',
      });
      await userRepository.save(existingUser);

      const user = await User.create({
        email: 'test@test.com',
        password: 'test1234',
        nickname: 'tester',
      });
      await userRepository.save(user);

      jest.spyOn(userRepository, 'findOneById').mockResolvedValue(user);
      jest
        .spyOn(userRepository, 'findOneByNickname')
        .mockResolvedValue(existingUser);

      const updateInfoRequestDto: UpdateInfoRequestDto = {
        password: 'test1234',
        nickname: 'existingnickname',
      };

      await expect(
        userService.updateInfo(1, updateInfoRequestDto),
      ).rejects.toThrow(ConflictException);
    });

    it('닉네임을 성공적으로 업데이트한다.', async () => {
      const user = await User.create({
        email: 'test@test.com',
        password: 'test1234',
        nickname: 'tester',
      });
      await userRepository.save(user);

      jest.spyOn(userRepository, 'findOneById').mockResolvedValue(user);
      jest.spyOn(userRepository, 'findOneByNickname').mockResolvedValue(null);
      jest.spyOn(user, 'updateNickname').mockImplementation();
      jest.spyOn(userRepository, 'save').mockResolvedValue(user);

      const updateInfoRequestDto: UpdateInfoRequestDto = {
        password: 'test1234',
        nickname: 'newnickname',
      };

      await userService.updateInfo(1, updateInfoRequestDto);

      expect(user.updateNickname).toHaveBeenCalledWith('newnickname');
      expect(userRepository.save).toHaveBeenCalledWith(user);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
