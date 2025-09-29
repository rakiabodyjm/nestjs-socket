import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ErrorsInterceptor } from 'src/errors/errors.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // globally use the class-serializer interceptor
  app.useGlobalInterceptors(new ErrorsInterceptor());
  // globally use validation pipe as well
  app.useGlobalPipes(
    new ValidationPipe({
      stopAtFirstError: true,
    }),
  );

  app.enableCors();

  await app.listen(3000, '0.0.0.0');
}
bootstrap();
