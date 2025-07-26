import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { NestApplicationOptions, ValidationPipe, VersioningType } from '@nestjs/common';
import helmet from '@fastify/helmet'
import fastifyCsrf from '@fastify/csrf-protection';
import { AppConfigService, AppConfigServiceToken } from './shared/infrastructure/config/app-config.service';
import fastifyCookie from '@fastify/cookie';
import fastifySession from '@fastify/session';
import { RedisServiceToken } from './shared/infrastructure/redis/providers/redis.service';
import Redis from 'ioredis';
import fastifyRedis from "@fastify/redis"
import { RedisSessionStore, RedisSessionStoreToken } from './shared/infrastructure/redis/providers/redis-session.store';

async function bootstrap() {
  const adapter = new FastifyAdapter()

  const app = await NestFactory.create(
    AppModule,
    new FastifyAdapter() as unknown as NestApplicationOptions,
  ) as NestFastifyApplication;

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
  }))

  app.setGlobalPrefix("/api")
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: "v",
    defaultVersion: ["1"]
  })

  const appConfig = app.get<AppConfigService>(AppConfigServiceToken);
  const redisService = app.get<Redis>(RedisServiceToken);
  const redisSessionStore = app.get<RedisSessionStore>(RedisSessionStoreToken);

  await app.register(fastifyCookie)

  await app.register(fastifyRedis, {
    client: redisService
  });

  await app.register(fastifySession, {
    secret: appConfig.SESSION_SECRET, // store in env
    saveUninitialized: false,
    store: redisSessionStore,
    cookie: { secure: false, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }, // set true if using HTTPS
  });

  app.enableCors({
    origin: "*",
    credentials: true
  })

  // await app.use(passport.initialize())
  // await app.use(passport.session())
  await app.register(helmet)
  await app.register(fastifyCsrf, {
    sessionPlugin: '@fastify/session',
  });

  await app.listen(appConfig.PORT);
}
bootstrap();
