import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = Number(process.env.PORT ?? 3002);
  app.enableCors({ origin: '*' });
  app.setGlobalPrefix('api');
  await app.listen(port, '0.0.0.0');
  console.log(`POS Service running on :${port}`);
}

void bootstrap();
