import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { PrismaService } from '../prisma/prisma.service';
import { RolesGuard } from '../auth/guards/roles.guard';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, PrismaService, RolesGuard],
})
export class ProductsModule {}
