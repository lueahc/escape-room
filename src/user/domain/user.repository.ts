import { User } from "./user.entity";

export interface UserRepository {
    find(): Promise<User[]>;
    save(user: User): Promise<User>;
    findOneById(id: number);
    findOneByEmail(email: string);
    findOneByNickname(nickname: string);
    create(user: Partial<User>): User;
}