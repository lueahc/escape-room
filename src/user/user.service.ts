import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { SignUpRequestDto } from './dto/signUp.request.dto';
import * as bcrypt from 'bcrypt';
import { SignInRequestDto } from './dto/signIn.request.dto';
import { AuthService } from 'src/auth/auth.service';
import { SignUpResponseDto } from './dto/signUp.response.dto';
import { UpdateInfoRequestDto } from './dto/updateInfo.request.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly authService: AuthService,
    ) { }

    async findOneById(userId: number) {
        return await this.userRepository.findOne({
            where: {
                id: userId,
            },
        });
    }

    async findOneByEmail(userEmail: string) {
        return await this.userRepository.findOne({
            where: {
                email: userEmail,
            },
        });
    }

    async isSameUser(userId: number, targetId: number): Promise<boolean> {
        const user = await this.findOneById(userId);
        const targetUser = await this.findOneById(targetId);

        if (user === targetUser) {
            return true;
        }
        return false;
    }

    async signUp(signUpRequestDto: SignUpRequestDto) {
        const { email, password, nickname } = signUpRequestDto;

        const existUser = await this.findOneByEmail(email);
        if (existUser) {
            throw new ConflictException(
                '이미 존재하는 이메일입니다.',
                'EXISTING_EMAIL'
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
            nickname: user.nickname,
            accessToken,
        };
    }

    async updateInfo(userId: number, updateInfoRequestDto: UpdateInfoRequestDto) {
        const user = await this.findOneById(userId);
        if (!user) {
            throw new NotFoundException(
                '사용자가 존재하지 않습니다.',
                'NON_EXISTING_USER'
            );
        }

        const { nickname } = updateInfoRequestDto;

        user.nickname = nickname;
        await this.userRepository.save(user);

        return user;
    }
}
