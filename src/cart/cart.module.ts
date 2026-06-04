import { Module } from '@nestjs/common';
import { CartService} from './cart.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CartController } from './cart.controller';
import { RolesGuard } from '../auth/guards/roles.guard';

@Module({
  imports: [PrismaModule],
  controllers: [CartController],
  providers: [CartService, RolesGuard],
  exports: [CartService],
})
export class CartModule {}
