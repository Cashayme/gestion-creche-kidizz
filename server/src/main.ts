import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import cors from 'cors';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.use(
    cors({
      origin: 'http://localhost:3000', // L'URL de votre frontend
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'X-Auth'],
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Gestion de crèche API')
    .setDescription('API pour la gestion des crèches et des enfants')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useLogger(['debug', 'error', 'log', 'verbose', 'warn']);
  console.log('Database connection established');
  const port = 3001; // ou le port que vous utilisez
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
