import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express'; 
import * as path from 'path'; 

async function bootstrap() {

    // Creamos la aplicación NestJS y habilitamos CORS (temporalmente antes de enableCors)
    const app = await NestFactory.create(AppModule, { cors: true });

    // Habilita el servicio de archivos estáticos (para uploads)
    app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'))); 

    // Establece el prefijo global para todas las rutas API
    app.setGlobalPrefix('api'); 


    // Configuración explícita de CORS
    app.enableCors({
        // Origen del frontend (ej: React/Vite)
        origin: 'http://localhost:5173', 
        
       
        methods: 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
        
        allowedHeaders: 'Content-Type, Authorization',
        credentials: true,
    });

    
    // Configuración de los pipes de validación global
    app.useGlobalPipes(
        new ValidationPipe({
            // Solo permite propiedades definidas en los DTOs
            whitelist: true,
            // Rechaza peticiones con propiedades no definidas (buena práctica de seguridad)
            forbidNonWhitelisted: true, 
            // Transforma los tipos de datos (ej: strings a numbers en IDs)
            transform: true,
            transformOptions: { enableImplicitConversion: true },
        }),
    );


    // PUERTO: Se usa 3333 por defecto
    await app.listen(process.env.PORT ?? 3333); 

    console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();