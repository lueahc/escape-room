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

    async find(): Promise<User[]> {
        return await this.userRepository.find();
    }

    async save(user: User): Promise<User> {
        return await this.userRepository.save(user);
    }

    async findOneById(id: number) {
        return await this.userRepository.findOne({
            where: {
                _id: id
            },
        });
    }

    async findOneByEmail(email: string) {
        return await this.userRepository.findOne({
            where: {
                _email: email
            },
        });
    }

    async findOneByNickname(nickname: string) {
        return await this.userRepository.findOne({
            where: {
                _nickname: nickname
            },
        });
    }

    create(user: Partial<User>): User {
        return this.userRepository.create(user);
    }
}