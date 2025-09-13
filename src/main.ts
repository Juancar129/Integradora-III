import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuración global de validación para todos los DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            
      forbidNonWhitelisted: true,  
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Inicializar Swagger
  const config = new DocumentBuilder()
    .setTitle('API de Ejemplo')
    .setDescription('Backend del proyecto de ejemplo')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Endpoint donde estará la documentación
  SwaggerModule.setup('api', app, document);

  // Iniciar servidor
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
