import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = Number(process.env.PORT ?? process.env.API_PORT ?? 3001);
  const origin = process.env.CORS_ORIGIN ?? '*';

  app.enableCors({ origin });
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Smartstore POS API')
    .setDescription('POS Service — endpoints for dashboard, products, orders, users, and reports')
    .setVersion('1.0')
    .addTag('pos')
    .addTag('admin')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port, '0.0.0.0');
  console.log(`POS Service listening on :${port}`);
  console.log(`Swagger docs → http://localhost:${port}/api/docs`);
}

void bootstrap();


