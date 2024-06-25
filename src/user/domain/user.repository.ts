import { User } from "./user.entity";

export interface UserRepository {
    save(user: User): Promise<User>;
    findOneById(id: number): Promise<User | null>;
    findOneByEmail(email: string): Promise<User | null>;
    findOneByNickname(nickname: string): Promise<User | null>;
}