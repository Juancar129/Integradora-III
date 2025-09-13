// paypal.module.ts
import { Module } from '@nestjs/common';
import { PaypalService } from './paypal.service';
import { PaypalController } from './paypal.controller';
import { HttpModule } from '@nestjs/axios';
import { OrdersService } from '../orders/orders.service';

@Module({
  imports: [HttpModule], 
  controllers: [PaypalController],
  providers: [PaypalService, OrdersService],
})
export class PaypalModule {}
