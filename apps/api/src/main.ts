import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { generate } from 'selfsigned';

async function bootstrap() {
  // certificado casero para HTTPS en desarrollo (versión async)
  const pems = await generate(
    [{ name: 'commonName', value: 'localhost' }],
    { keySize: 2048 },
  );

  const app = await NestFactory.create(AppModule, {
    httpsOptions: { key: pems.private, cert: pems.cert },
  });

  app.enableCors({ origin: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();