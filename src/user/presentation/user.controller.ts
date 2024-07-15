import { Body, Controller, Get, HttpCode, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { UserService } from '../application/user.service';
import { SignUpRequestDto } from '../application/dto/signUp.request.dto';
import { SignInRequestDto } from '../application/dto/signIn.request.dto';
import { JwtAuthGuard } from '../../jwt/jwt.auth.guard';
import { UpdateInfoRequestDto } from '../application/dto/updateInfo.request.dto';
import { User } from './user.decorator';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';

@Controller('user')
@ApiTags('user API')
export class UserController {
    constructor(
        private userService: UserService
    ) { }

    @Post('/signUp')
    @ApiOperation({ summary: '회원가입 API', description: '회원을 생성함' })
    signUp(@Body() signUpRequestDto: SignUpRequestDto) {
        return this.userService.signUp(signUpRequestDto);
    }

    @Post('/signIn')
    @HttpCode(200)
    @ApiOperation({ summary: '로그인 API' })
    signIn(@Body() signInRequestDto: SignInRequestDto) {
        return this.userService.signIn(signInRequestDto);
    }

    @Patch('/info')
    @HttpCode(204)
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: '회원 정보 수정 API', description: '회원의 정보를 수정함' })
    @ApiSecurity('AdminAuth')
    updateInfo(
        @User('_id') userId: number,
        @Body() updateInfoRequestDto: UpdateInfoRequestDto): Promise<void> {
        return this.userService.updateInfo(userId, updateInfoRequestDto);
    }

    @Get('/search')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: '회원 검색 API', description: '닉네임으로 회원을 검색함' })
    @ApiSecurity('AdminAuth')
    searchUser(
        @User('_id') userId: number,
        @Query('nickname') nickname: string) {
        return this.userService.searchUser(userId, nickname);
    }
}
