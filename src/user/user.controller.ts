import { Body, Controller, Get, HttpCode, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { SignUpRequestDto } from './dto/signUp.request.dto';
import { SignInRequestDto } from './dto/signIn.request.dto';
import { JwtAuthGuard } from 'src/jwt/jwt.auth.guard';
import { UpdateInfoRequestDto } from './dto/updateInfo.request.dto';
import { User } from './user.decorator';

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

    @Patch('/info')
    @UseGuards(JwtAuthGuard)
    updateInfo(
        @User('id') userId: number,
        @Body() updateInfoRequestDto: UpdateInfoRequestDto) {
        return this.userService.updateInfo(userId, updateInfoRequestDto);
    }

    @Get('/search')
    @UseGuards(JwtAuthGuard)
    searchUser(
        @User('id') userId: number,
        @Query('nickname') nickname: string) {
        return this.userService.searchUser(userId, nickname);
    }
}
