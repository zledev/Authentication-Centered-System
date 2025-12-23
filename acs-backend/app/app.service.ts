import { ConflictException, Injectable } from '@nestjs/common';
import { prisma } from './lib/prisma';
import bcrypt from 'bcrypt';
import { Role } from './generated/prisma/enums';
import { PrismaClientKnownRequestError } from './generated/prisma/internal/prismaNamespace';

async function hashPassword(password: string): Promise<string> {
  const saltRounds = 5;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
}

@Injectable()
export class AppService {
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
}
