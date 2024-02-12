import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { SignUpRequestDto } from './dto/signUp.request.dto';
import { SignInRequestDto } from './dto/signIn.request.dto';

@Controller('user')
export class UserController {
    constructor(
        private userService: UserService
    ) { }

    @Post('/signUp')
    @HttpCode(201)
    signUp(@Body() signUpRequestDto: SignUpRequestDto) {
        return this.userService.signUp(signUpRequestDto);
    }

    @Post('/signIn')
    signIn(@Body() signInRequestDto: SignInRequestDto) {
        return this.userService.signIn(signInRequestDto);
    }
}
