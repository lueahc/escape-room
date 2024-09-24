import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../app.module';
import { DataSource } from 'typeorm';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { User } from '../domain/user.entity';
import { UserRepository } from '../domain/user.repository';
import { USER_REPOSITORY } from '../../common/inject.constant';

describe('UserRepository', () => {
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

  describe('save()', () => {
    it('사용자 엔티티를 저장한다.', async () => {
      const user = await User.create({
        email: 'test@test.com',
        password: 'test1234',
        nickname: 'tester',
      });
      await userRepository.save(user);

      const foundUser = await userRepository.findOneById(user.getId());
      expect(foundUser).toBeDefined();
      expect(foundUser?.getId()).toBeDefined();
      expect(foundUser?.getEmail()).toBe(user.getEmail());
      expect(foundUser?.getNickname()).toBe(user.getNickname());
    });
  });

  describe('findOne()', () => {
    let savedUser: User;
    beforeEach(async () => {
      const user = await User.create({
        email: 'test@test.com',
        password: 'test1234',
        nickname: 'tester',
      });
      savedUser = await userRepository.save(user);
    });

    it('id로 사용자를 찾는다.', async () => {
      const result = await userRepository.findOneById(1);
      expect(result).toEqual(savedUser);
    });

    it('이메일로 사용자를 찾는다.', async () => {
      const result = await userRepository.findOneByEmail('test@test.com');
      expect(result).toEqual(savedUser);
    });

    it('닉네임으로 사용자를 찾는다.', async () => {
      const result = await userRepository.findOneByNickname('tester');
      expect(result).toEqual(savedUser);
    });

    it('존재하지 않는 ID로 사용자를 찾을 때 null을 반환한다.', async () => {
      const result = await userRepository.findOneById(999);
      expect(result).toBeNull();
    });

    it('존재하지 않는 이메일로 사용자를 찾을 때 null을 반환한다.', async () => {
      const result = await userRepository.findOneByEmail(
        'nonexistent@test.com',
      );
      expect(result).toBeNull();
    });

    it('존재하지 않는 닉네임으로 사용자를 찾을 때 null을 반환한다.', async () => {
      const result = await userRepository.findOneByNickname('nonexistent');
      expect(result).toBeNull();
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
