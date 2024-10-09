import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import * as morgan from 'morgan';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORSを有効にする
  app.enableCors({
    origin: 'http://localhost:3000', // Next.jsアプリのURL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.use(cookieParser());

  // Morganロガーを追加
  app.use(morgan('dev'));

  await app.listen(3001);
}
bootstrap();
