import {
  Body,
  Controller,
  Get,
  Ip,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { Session, User } from '@prisma/client';
import { Request } from 'express';
import { CurrentUser, Public } from 'src/common/decorators';
import { exclude } from 'src/common/utils';
import { GoogleLoginDto } from './dto';
import { TokensEntity } from './entities';
import { RtAuthGuard } from './guards';
import { AuthService, SessionsService, UsersService } from './services';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly sessionsService: SessionsService,
  ) {}

  @Post('google')
  @Public()
  @ApiBody({ type: GoogleLoginDto })
  @ApiResponse({ status: 200, type: TokensEntity })
  public async googleLogin(
    @Body() dto: GoogleLoginDto,
    @Req() request: Request,
    @Ip() ip: string,
  ) {
    const { accessToken, account } = await this.authService.googleLogin(
      dto.code,
    );

    const user = await this.usersService.findOrCreateUser(
      'GOOGLE',
      account.id,
      accessToken,
      account.email,
      account.name,
    );

    const deviceName = request.headers['user-agent'] || 'Unknown device';

    const tokens = await this.sessionsService.login(user, ip, deviceName);

    return tokens;
  }

  @Post('refresh')
  @Public()
  @UseGuards(RtAuthGuard)
  public async refresh(@Body('token') token: string) {
    const accessToken = await this.sessionsService.makeAccessToken(token);

    return { accessToken };
  }

  @Get('sessions')
  public async sessions(
    @CurrentUser() user: User,
  ): Promise<Omit<Session, 'sessionToken'>[]> {
    const sessions = await this.sessionsService.findAllSessions(user.id);

    return sessions.map((session) => exclude(session, ['sessionToken']));
  }

  @Get('me')
  public async me(@CurrentUser() user: User) {
    return exclude(user, ['accounts']);
  }

  @Get('accounts')
  public async accounts(@CurrentUser() user: User) {
    return user.accounts.map((account) =>
      exclude(account, ['access_token', 'providerAccountId']),
    );
  }

  @Post('logout')
  @Public()
  @UseGuards(RtAuthGuard)
  public async logout(@CurrentUser() user: User, @Body('token') token: string) {
    await this.sessionsService.logout(user.id, token);

    return { message: 'Logged out successfully' };
  }
}
