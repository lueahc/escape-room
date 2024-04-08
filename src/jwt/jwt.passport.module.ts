import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { UserModule } from "../user/user.module";
import { JwtStrategy } from "./jwt.strategy";

@Module({
    imports: [PassportModule, UserModule],
    providers: [JwtStrategy],
    exports: [JwtStrategy]
})
export class JwtPassportModule { }
