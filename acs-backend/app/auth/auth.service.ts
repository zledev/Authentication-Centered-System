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

async function hashPassword(password: string): Promise<string> {
  const saltRounds = 5;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
}

@Injectable()
export class AuthService {
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

  async login_user(email: string, password: string) {
    const hashed: string = await hashPassword(password);

    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (user) {
      if (user.password == hashed) {
      }

      throw new UnauthorizedException('Password does not match!');
    }

    throw new NotFoundException('Account does not exists!');
  }
}
