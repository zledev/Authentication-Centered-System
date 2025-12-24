import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { RedisController } from './redis/redis.controller';
import { RedisService } from './redis/redis.service';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [AuthModule, RedisModule],
  controllers: [AppController, RedisController],
  providers: [AppService, RedisService],
})
export class AppModule {}
