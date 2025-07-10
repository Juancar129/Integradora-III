import { Module } from '@nestjs/common';
import { CartService} from './cart.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
