import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crea una orden normal (pago sin PayPal).
   * Se corrigen los errores de TypeScript al incluir los campos de envío requeridos.
   */
  async create(userId: number, dto: CreateOrderDto) {
    return this.prisma.order.create({
      data: {
        userId,
        total: dto.total,
        // 💡 CORRECCIÓN TS: Campos de envío requeridos por el modelo Order
        recipientName: dto.recipientName,
        streetAddress: dto.streetAddress,
        city: dto.city,
        postalCode: dto.postalCode,
        country: dto.country,
        // Fin de corrección
        orderItems: {
          create: dto.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: { orderItems: true },
    });
  }

  /**
   * Crea una orden después de la captura de PayPal.
   * Se corrigen los parámetros para aceptar los 5 campos de envío extraídos de PayPal.
   */
  async createFromPaypal(
    userId: number, 
    paypalId: string, 
    amount: number, 
    status: string,
    // 💡 Nuevos parámetros de envío
    recipientName: string,
    streetAddress: string,
    city: string,
    postalCode: string,
    country: string,
  ) {
    return this.prisma.order.create({
      data: {
        userId,
        total: amount,
        status,
        paypalId,
        // Asignar los datos de envío
        recipientName, 
        streetAddress,
        city,
        postalCode,
        country,
      },
      // ⚠️ NOTA: Esta función aún no guarda los 'orderItems', solo el total y el estado.
      // Recuerda que el flujo de PayPal requiere guardar los items en el create-order.
    });
  }

  async findByUser(userId: number) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { orderItems: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}