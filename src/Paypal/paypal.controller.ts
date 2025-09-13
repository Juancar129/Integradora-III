import { Controller, Post, Body, Param, Request, UseGuards } from '@nestjs/common';
import { PaypalService } from './paypal.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard'; 

@Controller('paypal')
export class PaypalController {
  constructor(private readonly paypalService: PaypalService) {}

  @Post('create-order')
  @UseGuards(JwtAuthGuard) 
  async createOrder(@Body('amount') amount: string, @Request() req) {
    const userId = req.user.userId; 
    return this.paypalService.createOrder(amount);
  }

  @Post('capture/:orderId')
  @UseGuards(JwtAuthGuard)
  async capture(@Param('orderId') orderId: string, @Request() req) {
    const userId = req.user.userId; 
    return this.paypalService.captureOrder(orderId, userId);
  }
}
