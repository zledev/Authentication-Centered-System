import { Injectable } from '@nestjs/common';
import Redis, { RedisOptions } from 'ioredis';

@Injectable()
export class RedisService {
  private RedisList: Record<string, Redis> = {};

  getClient(id: string) {
    return this.RedisList[id];
  }

  newClient(
    id: string,
    config: RedisOptions = {
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
    },
  ) {
    const client = new Redis(config);
    this.RedisList[id] = client;
    return client;
  }

  async closeClient(id: string) {
    const client = this.RedisList[id];
    if (!client) return;

    try {
      await client.quit();
      delete this.RedisList[id];
    } catch (e) {
      console.error('Failed to close client! INFO: ', e);
      throw e;
    }
  }
}
