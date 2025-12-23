import {
  Controller,
  Get,
  Post,
  Body,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AppService } from './app.service';
import { UserDTO } from './app.dto';

@Controller('auth')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('/register')
  async register(@Body() body: UserDTO) {
      await this.appService.register_user(body.email, body.password);
  }
}
