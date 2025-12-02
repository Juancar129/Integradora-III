import { Controller, Post, Body, Param, Request, UseGuards, Logger, HttpException } from '@nestjs/common';
import { PaypalService } from './paypal.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; 
import { CreatePaypalOrderDto } from './dto/create-paypal-order.dto'; 

@Controller('paypal')
export class PaypalController {
  private readonly logger = new Logger(PaypalController.name);

  constructor(private readonly paypalService: PaypalService) {}

  @Post('create-order')
  @UseGuards(JwtAuthGuard) 
  async createOrder(@Body() orderDto: CreatePaypalOrderDto, @Request() req) { 
    
    const amount = orderDto.total.toFixed(2); 

    this.logger.log(`Usuario ID: ${req.user.userId} | Creando orden PayPal.`);
    this.logger.log(`Monto formateado para PayPal: ${amount}`);

    const paypalResponse = await this.paypalService.createOrder(amount);
    
    // 1. Encontrar el enlace de aprobación dentro del array 'links'
    const approveLink = paypalResponse.links.find(
      // PayPal usa 'approve' para el enlace de redirección del usuario
      (link) => link.rel === 'approve', 
    ); 

    if (!approveLink || !approveLink.href) {
        this.logger.error('No se encontró el enlace de aprobación en la respuesta de PayPal.', paypalResponse);
        // Lanza una excepción si el enlace falta
        throw new HttpException('Error: Enlace de aprobación de PayPal no encontrado.', 500);
    }

    // 2. Devolver la respuesta en el formato exacto que espera el frontend (Checkout.jsx)
    return { 
        approvalUrl: approveLink.href, // <--- ¡AQUÍ ESTÁ LA CORRECCIÓN!
        paypalId: paypalResponse.id
    };
  }

  @Post('capture/:orderId')
  @UseGuards(JwtAuthGuard)
  async capture(@Param('orderId') orderId: string, @Request() req) {
    const userId = req.user.userId; 
    return this.paypalService.captureOrder(orderId, userId);
  }
}