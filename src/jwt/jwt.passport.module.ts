import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { UserModule } from "src/user/user.module";
import { JwtStrategy } from "./jwt.strategy";
import { USER_REPOSITORY } from "src/common/inject.constant";
import { TypeormUserRepository } from "src/user/infrastructure/typeormUser.repository";
import { User } from "src/user/domain/user.entity";
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
