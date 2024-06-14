import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { SignUpRequestDto } from './dto/signUp.request.dto';
import * as bcrypt from 'bcrypt';
import { SignInRequestDto } from './dto/signIn.request.dto';
import { AuthService } from 'src/auth/auth.service';
import { SignUpResponseDto } from './dto/signUp.response.dto';
import { UpdateInfoRequestDto } from './dto/updateInfo.request.dto';
import { USER_REPOSITORY } from 'src/inject.constant';
import { UserRepository } from './domain/user.repository';

@Injectable()
export class UserService {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: UserRepository,
        private readonly authService: AuthService,
    ) { }

    async findOneById(id: number) {
        return await this.userRepository.findOneById(id);
    }

    async searchUser(userId: number, nickname: string) {
        const user = await this.userRepository.findOneByNickname(nickname);
        if (!user) {
            throw new NotFoundException(
                '사용자가 존재하지 않습니다.',
                'NON_EXISTING_USER'
            );
        }

        if (user.getId() === userId) {
            throw new NotFoundException(
                '본인은 등록할 수 없습니다.',
                'NOT_ALLOWED_TO_TAG_ONESELF'
            );
        }

        return {
            userId: user.getId(),
            userNickname: user.getNickname()
        }
    }

    async signUp(signUpRequestDto: SignUpRequestDto): Promise<SignUpResponseDto> {
        const { email, password, nickname } = signUpRequestDto;

        const existUser = await this.userRepository.findOneByEmail(email);
        if (existUser) {
            throw new ConflictException(
                '이미 존재하는 이메일입니다.',
                'EXISTING_EMAIL'
            );
        }

        const existNickname = await this.userRepository.findOneByNickname(nickname);
        if (existNickname) {
            throw new ConflictException(
                '이미 존재하는 닉네임입니다.',
                'EXISTING_NICKNAME'
            );
        }

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = this.userRepository.create({ _email: email, _nickname: nickname });
        user.updatePassword(hashedPassword);
        const createdUser = await this.userRepository.save(user);

        return new SignUpResponseDto(createdUser);
    }

    async signIn(signInRequestDto: SignInRequestDto) {
        const { email, password } = signInRequestDto;

        const user = await this.userRepository.findOneByEmail(email);
        if (!user) {
            throw new NotFoundException(
                '사용자가 존재하지 않습니다.',
                'NON_EXISTING_USER'
            );
        }

        const isMatched = await bcrypt.compare(password, user.getPassword());
        if (!isMatched) {
            throw new BadRequestException(
                '비밀번호가 일치하지 않습니다.',
                'PASSWORD_MISMATCH'
            );
        }

        const accessToken = this.authService.signWithJwt({
            userId: user.getId(),
        });

        return {
            accessToken,
        };
    }

    async updateInfo(userId: number, updateInfoRequestDto: UpdateInfoRequestDto): Promise<void> {
        const user = await this.userRepository.findOneById(userId);
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

            user.updatePassword(hashedPassword);
        }

        if (nickname) {
            const existNickname = await this.userRepository.findOneByNickname(nickname);
            if (existNickname) {
                throw new ConflictException(
                    '이미 존재하는 닉네임입니다.',
                    'EXISTING_NICKNAME'
                );
            }

            user.updateNickname(nickname);
        }

        await this.userRepository.save(user);
    }
}
