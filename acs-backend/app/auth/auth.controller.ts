import {
  Controller,
  Get,
  Post,
  Body,
  Res,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDTO } from '../dtos/user.dto';
import type { Response } from 'express';
import { TOKEN_CONST } from '../constants/token';

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
    this.authService
      .validate_user(body.email, body.password)
      .then(async (result) => {
        this.authService
          .login_user({
            email: result.email,
            id: result.id,
          })
          .then((tokens) => {
            res.cookie(
              'refresh',
              { token: tokens.refresh.token, id: tokens.refresh.id },
              {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                path: '/auth/refresh', // TODO: Configure Path
                maxAge: TOKEN_CONST.REFRESH_TTL_SECONDS * 1000,
              },
            );

            return {
              message: 'Login Successful!',
              accessToken: tokens.accessToken,
            };
          })
          .catch((e: unknown) => {
            console.log('Login Failed: ', e);
            throw new InternalServerErrorException('Something went wrong!');
          });
      })
      .catch((e: unknown) => {
        console.log('Login Failed: ', e);
        throw new UnauthorizedException('Login Failed!');
      });
  }
}
