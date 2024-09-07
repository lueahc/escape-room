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
  let userRepository: UserRepository;

  beforeAll(async () => {
    initializeTransactionalContext();
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();

    dataSource = moduleRef.get<DataSource>(DataSource);
    userService = moduleRef.get<UserService>(UserService);
    userRepository = moduleRef.get<UserRepository>(USER_REPOSITORY);
  });

  beforeEach(async () => {
    await dataSource.dropDatabase();
    await dataSource.synchronize();
  });

  const createUser = async (
    id: number,
    email: string,
    password: string,
    nickname: string,
  ): Promise<User> => {
    const user = await User.create({
      id,
      email,
      password,
      nickname,
    });
    jest.spyOn(userRepository, 'save').mockResolvedValue(user);
    return user;
  };

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
        email: 'test@test.com',
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
        email: 'test@test.com',
        password: 'test1234',
        nickname: 'tester3',
      };
      jest.spyOn(userRepository, 'findOneByEmail').mockResolvedValue(null);
      jest.spyOn(userRepository, 'findOneByNickname').mockResolvedValue(null);
      await createUser(
        1,
        signUpRequestDto.email,
        signUpRequestDto.password,
        signUpRequestDto.nickname,
      );

      const result = await userService.signUp(signUpRequestDto);

      expect(result.userId).toBe(1);
      expect(result.userEmail).toBe(signUpRequestDto.email);
      expect(result.userNickname).toBe(signUpRequestDto.nickname);
    });
  });

  describe('signIn()', () => {
    it('사용자가 존재하지 않을 경우 NotFoundException 에러가 발생한다.', async () => {
      const signInRequestDto: SignInRequestDto = {
        email: 'test@test.com',
        password: 'test1234',
      };
      jest.spyOn(userRepository, 'findOneByEmail').mockResolvedValue(null);

      await expect(userService.signIn(signInRequestDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('비밀번호가 일치하지 않을 경우 BadRequestException 에러가 발생한다.', async () => {
      const user = await createUser(1, 'test@test.com', 'test1234', 'tester');
      jest.spyOn(userRepository, 'findOneByEmail').mockResolvedValue(user);
      const signInRequestDto: SignInRequestDto = {
        email: 'test@test.com',
        password: 'password123',
      };

      await expect(userService.signIn(signInRequestDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('로그인에 성공할 경우 토큰을 반환한다.', async () => {
      const user = await createUser(1, 'test@test.com', 'test1234', 'tester');
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
    });
  });

  describe('updateInfo()', () => {
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

    // it('비밀번호를 성공적으로 업데이트한다.', async () => {
    //   const user = await createUser(1, 'test@test.com', 'test1234', 'tester');
    //   jest.spyOn(userRepository, 'findOneById').mockResolvedValue(user);
    //   jest
    //     .spyOn(userService, 'hashPassword')
    //     .mockResolvedValue('hashedPassword');
    //   // jest.spyOn(userRepository, 'save').mockResolvedValue(user); -> createUser에 집어넣음
    //   const updateInfoRequestDto: UpdateInfoRequestDto = {
    //     password: 'newpassword123',
    //   };
    //   await userService.updateInfo(1, updateInfoRequestDto);

    //   expect(user.getPassword()).toBe('hashedPassword');
    // });

    it('닉네임이 이미 존재하는 경우 ConflictException 에러가 발생한다.', async () => {
      const existingUser = await createUser(
        1,
        'existing@test.com',
        'test1234',
        'existingnickname',
      );
      const user = await createUser(1, 'test@test.com', 'test1234', 'tester');
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
      const user = await createUser(1, 'test@test.com', 'test1234', 'tester');
      jest.spyOn(userRepository, 'findOneById').mockResolvedValue(user);
      jest.spyOn(userRepository, 'findOneByNickname').mockResolvedValue(null);

      const updateInfoRequestDto: UpdateInfoRequestDto = {
        nickname: 'newnickname',
      };
      await userService.updateInfo(1, updateInfoRequestDto);

      expect(user.getNickname()).toBe('newnickname');
    });
  });

  describe('searchUser()', () => {
    it('사용자가 존재하지 않을 경우 NotFoundException 에러가 발생한다.', async () => {
      const userId = 999;
      const nickname = 'nonexistinguser';
      jest.spyOn(userRepository, 'findOneByNickname').mockResolvedValue(null);

      await expect(userService.searchUser(userId, nickname)).rejects.toThrow(
        NotFoundException,
      );
    });

    // it('본인이 요청할 경우 BadRequestException 에러가 발생한다.', async () => {
    //   const userId = 1;
    //   const nickname = 'tester';
    //   const mockUser = {
    //     getId: () => userId,
    //     getNickname: () => nickname,
    //   };
    //   //const user = await createUser(1, 'test@test.com', 'test1234', 'tester');
    //   jest.spyOn(userRepository, 'findOneByNickname').mockResolvedValue(mockUser);

    //   await expect(userService.searchUser(userId, nickname)).rejects.toThrow(
    //     BadRequestException,
    //   );
    // });

    // it('사용자가 정상적으로 검색되고 결과가 반환된다.', async () => {
    //   const user1 = await createUser(1, 'test1@test.com', 'test1234', 'tester1');
    //   const user2 = await createUser(2, 'test2@test.com', 'test1234', 'tester2');
    //   const mockUser = {
    //     getId: () => user2.getId(),
    //     getNickname: () => user2.getNickname(),
    //   };
    //   jest.spyOn(userRepository, 'findOneByNickname').mockResolvedValue(mockUser);

    //   const result = await userService.searchUser(userId, nickname);

    //   expect(result).toEqual({
    //     userId: mockUser.getId(),
    //     userNickname: mockUser.getNickname(),
    //   });
    // });
  });

  afterAll(async () => {
    await app.close();
  });
});
