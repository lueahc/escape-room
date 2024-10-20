import { Injectable } from "@nestjs/common";
import { UserRepository } from "../domain/user.repository";
import { User } from "../domain/user.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class TypeormUserRepository implements UserRepository {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async save(user: User): Promise<User> {
        return await this.userRepository.save(user);
    }

    async findOneById(id: number): Promise<User | null> {
        return await this.userRepository.findOne({
            where: {
                _id: id
            },
        });
    }

    async findOneByEmail(email: string): Promise<User | null> {
        return await this.userRepository.findOne({
            where: {
                _email: email
            },
        });
    }

    async findOneByNickname(nickname: string): Promise<User | null> {
        return await this.userRepository.findOne({
            where: {
                _nickname: nickname
            },
        });
    }
}