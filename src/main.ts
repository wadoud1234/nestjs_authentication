import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { NestApplicationOptions, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(
    AppModule,
    new FastifyAdapter() as unknown as NestApplicationOptions,
  ) as NestFastifyApplication;

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
  }))
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
