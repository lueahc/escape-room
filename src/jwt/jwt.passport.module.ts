import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { UserModule } from "../user/user.module";
import { JwtStrategy } from "./jwt.strategy";
import { USER_REPOSITORY } from "../common/inject.constant";
import { TypeormUserRepository } from "../user/infrastructure/typeormUser.repository";
import { User } from "../user/domain/user.entity";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
    imports: [
        PassportModule,
        UserModule,
        TypeOrmModule.forFeature([User]),
    ],
    providers: [
        JwtStrategy,
        { provide: USER_REPOSITORY, useClass: TypeormUserRepository },
    ],
})
export class JwtPassportModule { }
