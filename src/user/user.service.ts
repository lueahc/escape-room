import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { SignUpRequestDto } from './dto/signUp.request.dto';
import * as bcrypt from 'bcrypt';
import { SignInRequestDto } from './dto/signIn.request.dto';
import { AuthService } from '../auth/auth.service';
import { SignUpResponseDto } from './dto/signUp.response.dto';
import { UpdateInfoRequestDto } from './dto/updateInfo.request.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly authService: AuthService,
    ) { }

    async findOneById(id: number) {
        return await this.userRepository.findOne({
            where: {
                id
            },
        });
    }

    async findOneByEmail(email: string) {
        return await this.userRepository.findOne({
            where: {
                email
            },
        });
    }

    async findOneByNickname(nickname: string) {
        return await this.userRepository.findOne({
            where: {
                nickname
            },
        });
    }

    async searchUser(userId: number, nickname: string) {
        const user = await this.findOneByNickname(nickname);
        if (!user) {
            throw new NotFoundException(
                '사용자가 존재하지 않습니다.',
                'NON_EXISTING_USER'
            );
        }

        if (user.id === userId) {
            throw new NotFoundException(
                '본인은 등록할 수 없습니다.',
                'NOT_ALLOWED_TO_TAG_ONESELF'
            );
        }

        return {
            userId: user.id,
            userNickname: user.nickname
        }
    }

    async signUp(signUpRequestDto: SignUpRequestDto): Promise<SignUpResponseDto> {
        const { email, password, nickname } = signUpRequestDto;

        const existUser = await this.findOneByEmail(email);
        if (existUser) {
            throw new ConflictException(
                '이미 존재하는 이메일입니다.',
                'EXISTING_EMAIL'
            );
        }

        const existNickname = await this.findOneByNickname(nickname);
        if (existNickname) {
            throw new ConflictException(
                '이미 존재하는 닉네임입니다.',
                'EXISTING_NICKNAME'
            );
        }

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = this.userRepository.create({ email, password: hashedPassword, nickname });
        const createdUser = await this.userRepository.save(user);

        return new SignUpResponseDto(createdUser);
    }

    async signIn(signInRequestDto: SignInRequestDto) {
        const { email, password } = signInRequestDto;

        const user = await this.findOneByEmail(email);
        if (!user) {
            throw new NotFoundException(
                '사용자가 존재하지 않습니다.',
                'NON_EXISTING_USER'
            );
        }

        const isMatched = await bcrypt.compare(password, user.password);
        if (!isMatched) {
            throw new BadRequestException(
                '비밀번호가 일치하지 않습니다.',
                'PASSWORD_MISMATCH'
            );
        }

        const accessToken = this.authService.signWithJwt({
            userId: user.id,
        });

        return {
            accessToken,
        };
    }

    async updateInfo(userId: number, updateInfoRequestDto: UpdateInfoRequestDto): Promise<void> {
        const user = await this.findOneById(userId);
        if (!user) {
            throw new NotFoundException(
                '사용자가 존재하지 않습니다.',
                'NON_EXISTING_USER'
            );
        }

        const { password, nickname } = updateInfoRequestDto;

        if (password) {
            const salt = await bcrypt.genSalt();
            const hashedPassword = await bcrypt.hash(password, salt);

            user.password = hashedPassword;
        }

        if (nickname) {
            const existNickname = await this.findOneByNickname(nickname);
            if (existNickname) {
                throw new ConflictException(
                    '이미 존재하는 닉네임입니다.',
                    'EXISTING_NICKNAME'
                );
            }

            user.nickname = nickname;
        }

        await this.userRepository.save(user);
    }
}
