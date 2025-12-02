// paypal.module.ts
import { Module } from '@nestjs/common';
import { PaypalService } from './paypal.service';
import { PaypalController } from './paypal.controller';
import { HttpModule } from '@nestjs/axios';
import { OrdersService } from '../orders/orders.service';
import { PrismaService } from '../prisma/prisma.service'; // Asegúrate de incluirlo si es usado

@Module({
  imports: [
    HttpModule.register({
      // 💡 Configuración del tiempo de espera de 5 segundos
      timeout: 5000, 
      maxRedirects: 5,
    }),
  ],
  controllers: [PaypalController],
  // Asegúrate de incluir OrdersService y PrismaService si son inyectados
  providers: [PaypalService, OrdersService, PrismaService], 
})
export class PaypalModule {}