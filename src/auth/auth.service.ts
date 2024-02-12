import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService
    ) { }

    signWithJwt(payload: object) {
        return this.jwtService.sign(payload);
    }
}
