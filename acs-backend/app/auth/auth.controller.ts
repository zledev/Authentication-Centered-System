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

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  async register(@Body() body: UserDTO): Promise<void> {
    await this.authService.register_user(body.email, body.password);
  }

  @Post('/login')
  async login(@Body() body: UserDTO): Promise<void> {}
}
