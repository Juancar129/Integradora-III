import { Controller, Get, Post, Delete, Param, Req, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('cart')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('user')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@Req() req) {
    const userId = req.user.id;
    return this.cartService.getCart(userId);
  }

  @Post('add/:productId')
  addProduct(@Req() req, @Param('productId') productId: number) {
    const userId = req.user.id;
    return this.cartService.addProduct(userId, +productId);
  }

  @Delete('remove/:productId')
  removeProduct(@Req() req, @Param('productId') productId: number) {
    const userId = req.user.id;
    return this.cartService.removeProduct(userId, +productId);
  }
}
