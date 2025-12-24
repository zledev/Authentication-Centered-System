import {
  ConflictException,
  Injectable,
  NotAcceptableException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcrypt';
import { Role } from '../generated/prisma/enums';
import { PrismaClientKnownRequestError } from '../generated/prisma/internal/prismaNamespace';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../dtos/jwt.dto';
import { RedisService } from '../redis/redis.service';
import Redis from 'ioredis';

async function hashPassword(password: string): Promise<string> {
  const saltRounds = 5;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
}

@Injectable()
export class AuthService {
  private redis: Redis;

  constructor(
    private jwtservice: JwtService,
    private redisService: RedisService,
  ) {
    this.redis = this.redisService.newClient('AuthService');
  }

  async register_user(email: string, password: string) {
    const hashed: string = await hashPassword(password);

    const data = {
      email: email,
      password: hashed,
      role: Role.USER,
      createdAt: new Date(),
    };

    try {
      const user = await prisma.user.create({ data });
      console.log('Created New User: ', user);
    } catch (e: unknown) {
      if (e instanceof PrismaClientKnownRequestError && e.code == 'P2002') {
        throw new ConflictException('Account already exist!');
      }

      throw e;
    }
  }

  async validate_user(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (user) {
      if (await bcrypt.compare(password, user.password)) {
        return {
          id: user.id,
          email: user.email,
        };
      }

      throw new UnauthorizedException('Password does not match!');
    }

    throw new NotFoundException('Account does not exists!');
  }

  async login_user(user: {
    email: string;
    id: string;
  }): Promise<{ refreshToken: string; accessToken: string }> {
    const payload = user;

    const accessToken = this.jwtservice.sign(
      { id: payload.id, email: payload.email, type: 'access' },
      { expiresIn: '15m' },
    );

    const refreshToken = this.jwtservice.sign(
      { id: payload.id, email: payload.email, type: 'refresh' },
      { secret: process.env.JWT_SECRET_REFRESH, expiresIn: '7d' },
    );

    
    // TODO: Save refresh token to Redis
    await prisma.userToken.create({
      data: {
        userId: user.id,
        email: user.email,
        refreshToken: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { accessToken, refreshToken };
  }

  validate_token(token: string, type: string): JwtPayload | undefined {
    if (type === 'access') {
      try {
        return this.jwtservice.verify<JwtPayload>(token, {
          secret: process.env.JWT_SECRET,
        });
      } catch (e) {
        throw new UnauthorizedException('Access Token is Invalid!', e);
      }
    } else if (type === 'refresh') {
      try {
        return this.jwtservice.verify<JwtPayload>(token, {
          secret: process.env.JWT_SECRET_REFRESH,
        });
      } catch (e) {
        throw new UnauthorizedException('Refresh Token is Invalid!', e);
      }
    }
  }
}
