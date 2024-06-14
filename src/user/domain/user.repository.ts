import { User } from "./user.entity";

export interface UserRepository {
    save(user: User): Promise<User>;
    create(user: Partial<User>): User;
    findOneById(id: number);
    findOneByEmail(email: string);
    findOneByNickname(nickname: string);
}