import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { RolesGuard } from '../auth/guards/roles.guard';

@Module({
  controllers: [  OrdersController],
  providers: [OrdersService, PrismaService, RolesGuard],
})
export class OrdersModule{}
