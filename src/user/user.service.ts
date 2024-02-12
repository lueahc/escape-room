import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { SignUpRequestDto } from './dto/signUp.request.dto';
import * as bcrypt from 'bcrypt';
import { SignInRequestDto } from './dto/signIn.request.dto';
import { AuthService } from 'src/auth/auth.service';

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

    async signUp(signUpRequestDto: SignUpRequestDto) {
        const { email, password } = signUpRequestDto;

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = this.userRepository.create({ email, password: hashedPassword });

        return await this.userRepository.save(user);
    }

    async signIn(signInRequestDto: SignInRequestDto) {
        const { email, password } = signInRequestDto;

        const user = await this.userRepository.findOne({
            where: {
                email,
            },
        });

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
}
