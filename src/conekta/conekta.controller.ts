import { Controller, Post, Body, Request, UseGuards, HttpException } from '@nestjs/common';
import { ConektaService } from './conekta.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('conekta')
export class ConektaController {
  constructor(private readonly conektaService: ConektaService) {}

  @Post('create-order')
  @UseGuards(JwtAuthGuard)
  async createOrder(@Body('amount') amount: number, @Body('currency') currency: string = 'MXN', @Request() req) {
    try {
      const userId = req.user?.userId || 'anonymous';
      return await this.conektaService.createOrder({ amount, currency, userId });
    } catch (error: any) {
      throw new HttpException(error.message || 'Error creando orden en Conekta', 500);
    }
  }

  @Post('capture-order/:id')
  @UseGuards(JwtAuthGuard)
  async captureOrder(@Body() body, @Request() req) {
    try {
      const orderId = body.id || body.orderId;
      return await this.conektaService.captureOrder(orderId);
    } catch (error: any) {
      throw new HttpException(error.message || 'Error capturando orden en Conekta', 500);
    }
  }
}
