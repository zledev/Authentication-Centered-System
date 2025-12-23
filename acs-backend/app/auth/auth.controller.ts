import {
  Controller,
  Get,
  Post,
  Body,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDTO } from '../dtos/user.dto';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  async register(@Body() body: UserDTO): Promise<void> {
    await this.authService.register_user(body.email, body.password);
  }

  @Post('/login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: UserDTO,
    @Res({ passthrough: true }) res: Response,
  ) {
    let tokens: { accessToken: string; refreshToken: string } = {
      accessToken: '',
      refreshToken: '',
    };

    await this.authService
      .validate_user(body.email, body.password)
      .then(async (r) => {
        tokens = await this.authService.login_user(r);

        res.cookie('refresh-token', tokens.refreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          path: '/auth/refresh',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });
      });

    return {
      message: 'Login Successful!',
      accessToken: tokens.accessToken,
    };
  }
}
