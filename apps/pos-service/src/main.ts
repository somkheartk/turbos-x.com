import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = Number(process.env.PORT ?? process.env.API_PORT ?? 3001);
  const origin = process.env.CORS_ORIGIN ?? '*';

  app.enableCors({ origin });
  app.setGlobalPrefix('api');

  await app.listen(port, '0.0.0.0');
  console.log(`POS Service listening on :${port}`);
}

void bootstrap();
