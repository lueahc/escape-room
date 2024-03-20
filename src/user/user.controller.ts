import { Body, Controller, Get, HttpCode, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { SignUpRequestDto } from './dto/signUp.request.dto';
import { SignInRequestDto } from './dto/signIn.request.dto';
import { JwtAuthGuard } from 'src/jwt/jwt.auth.guard';
import { UpdateInfoRequestDto } from './dto/updateInfo.request.dto';
import { User } from './user.decorator';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';

@Controller('user')
@ApiTags('user API')
export class UserController {
    constructor(
        private userService: UserService
    ) { }

    @Post('/signUp')
    @HttpCode(201)
    @ApiOperation({ summary: '회원가입 API', description: '회원을 생성함' })
    signUp(@Body() signUpRequestDto: SignUpRequestDto) {
        return this.userService.signUp(signUpRequestDto);
    }

    @Post('/signIn')
    @ApiOperation({ summary: '로그인 API' })
    signIn(@Body() signInRequestDto: SignInRequestDto) {
        return this.userService.signIn(signInRequestDto);
    }

    @Patch('/info')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: '회원 정보 수정 API', description: '회원의 정보를 수정함' })
    @ApiSecurity('AdminAuth')
    updateInfo(
        @User('id') userId: number,
        @Body() updateInfoRequestDto: UpdateInfoRequestDto) {
        return this.userService.updateInfo(userId, updateInfoRequestDto);
    }

    @Get('/search')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: '회원 검색 API', description: '닉네임으로 회원을 검색함' })
    @ApiSecurity('AdminAuth')
    searchUser(
        @User('id') userId: number,
        @Query('nickname') nickname: string) {
        return this.userService.searchUser(userId, nickname);
    }
}
