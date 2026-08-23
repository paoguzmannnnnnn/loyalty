import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { generate } from 'selfsigned';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

async function getCert() {
  const dir = join(process.cwd(), 'certs');
  const keyPath = join(dir, 'key.pem');
  const certPath = join(dir, 'cert.pem');
  if (existsSync(keyPath) && existsSync(certPath)) {
    return { key: readFileSync(keyPath), cert: readFileSync(certPath) };
  }
  const pems = await generate([{ name: 'commonName', value: 'localhost' }], { keySize: 2048 });
  mkdirSync(dir, { recursive: true });
  writeFileSync(keyPath, pems.private);
  writeFileSync(certPath, pems.cert);
  return { key: pems.private, cert: pems.cert };
}

async function bootstrap() {
  // en producción (Render) NO usamos certificado propio: el hosting da HTTPS
  const esProduccion = process.env.NODE_ENV === 'production';

  const app = esProduccion
    ? await NestFactory.create(AppModule)
    : await NestFactory.create(AppModule, { httpsOptions: await getCert() });

  app.enableCors({ origin: true }); // lo afinamos con el dominio real más adelante
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();