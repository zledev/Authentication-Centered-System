import {
  Controller,
  Get,
  Post,
  Body,
  Res,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDTO } from '../dtos/user.dto';
import type { Request, Response } from 'express';
import { TOKEN_CONST } from '../constants/token';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  async register(@Body() body: UserDTO): Promise<void> {
    await this.authService.register_user(body.email, body.password);
  }

  @Post('/sign-in')
  @HttpCode(HttpStatus.OK)
  async signIn(
    @Body() body: UserDTO,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const validation = await this.authService.validate_user(
        body.email,
        body.password,
      );

      const tokens = await this.authService.signin_user({
        email: validation.email,
        id: validation.id,
      });

      res.cookie(
        'refresh',
        JSON.stringify({ token: tokens.refresh.token, id: tokens.refresh.id }),
        {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          maxAge: TOKEN_CONST.REFRESH_TTL_SECONDS * 1000,
          signed: true,
        },
      );

      return {
        message: 'Login Successful!',
        accessToken: tokens.accessToken,
      };
    } catch (e: unknown) {
      console.log('Login Failed: ', e);
      throw e;
    }
  }

  @Post('/sign-out')
  @HttpCode(HttpStatus.OK)
  signout_user(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const cookie = req.signedCookies['refresh'];

    if (cookie) {
      const refresh = JSON.parse(cookie);
      this.authService.signout_user(refresh.id);
      res.clearCookie('refresh');
    }
  }
}