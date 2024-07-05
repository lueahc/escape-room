import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { USER_REPOSITORY } from '../common/inject.constant';
import { UserRepository } from '../user/domain/user.repository';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariable } from '../config/environmentVariable.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: UserRepository,
        private readonly configService: ConfigService<EnvironmentVariable>,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET')
        });
    }

    async validate(payload: any) {
        const user = await this.userRepository.findOneById(payload.userId);
        if (!user) {
            throw new UnauthorizedException(
                '입력한 토큰에 해당하는 사용자는 존재하지 않습니다.',
                'NOT_EXISTING_USER_IN_TOKEN',
            );
        }
        return user;
    }
}