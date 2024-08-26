import { User } from '../domain/user.entity';
import { UserRepository } from '../domain/user.repository';

export class TestUserRepository implements UserRepository {
  private nextId = 1;
  private users: User[] = [];

  async save(user: User) {
    user._id = this.nextId++;
    this.users.push(user);
    return user;
  }

  async findOneById(id: number): Promise<User | null> {
    return this.users.find((user) => user.getId() === id) || null;
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.users.find((user) => user.getEmail() === email) || null;
  }

  async findOneByNickname(nickname: string): Promise<User | null> {
    return this.users.find((user) => user.getNickname() === nickname) || null;
  }

  reset() {
    this.nextId = 1;
    this.users = [];
  }
}
