import { 
  Controller,
  Post,
  Body,
  Param,
  Request,
  UseGuards,
  Logger,
  HttpException,
  HttpStatus
} from '@nestjs/common';
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
    try {
      const rawTotal = orderDto.total;

      // 🔥 1. Validación segura del total
      const totalNumber = Number(rawTotal);

      if (isNaN(totalNumber) || totalNumber <= 0) {
        this.logger.error(`Total inválido recibido: ${rawTotal}`);
        throw new HttpException(
          'El total enviado no es válido.',
          HttpStatus.BAD_REQUEST
        );
      }

      // 🔥 2. Formato EXACTO para PayPal (dos decimales)
      const amount = totalNumber.toFixed(2);

      this.logger.log(`Usuario ID: ${req.user.userId} | Creando orden PayPal.`);
      this.logger.log(`Monto formateado para PayPal: ${amount}`);

      // 🔥 3. Crear orden en PayPal
      const paypalResponse = await this.paypalService.createOrder(amount);

      if (!paypalResponse || !paypalResponse.links) {
        throw new HttpException(
          'Respuesta inesperada de PayPal.',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      // 🔥 4. Buscar el link correcto (approve o payer-action)
      const approveLink = paypalResponse.links.find(
        (l) => l.rel === 'approve' || l.rel === 'payer-action'
      );

      if (!approveLink?.href) {
        this.logger.error('PayPal no envió link de aprobación.', paypalResponse);
        throw new HttpException(
          'PayPal no envió el enlace de aprobación.',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      // 🔥 5. Respuesta EXACTA que el frontend espera
      return {
        approvalUrl: approveLink.href,
        paypalId: paypalResponse.id,
      };

    } catch (error) {
      this.logger.error('Error al crear orden PayPal:', error);
      throw new HttpException(
        error?.message || 'Error interno al procesar orden PayPal.',
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('capture/:orderId')
  @UseGuards(JwtAuthGuard)
  async capture(@Param('orderId') orderId: string, @Request() req) {
    const userId = req.user.userId;
    return this.paypalService.captureOrder(orderId, userId);
  }
}
