import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreatePaypalOrderDto } from '../Paypal/dto/create-paypal-order.dto';
import { OrderStatus } from './dto/update-order-status.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async validateOrderItems(items: { productId: number; quantity: number; price: number }[]) {
    if (!Array.isArray(items) || items.length === 0) {
      throw new BadRequestException('La orden debe incluir al menos un producto.');
    }

    const invalidItem = items.find(
      (item) =>
        !Number.isInteger(item.productId) ||
        item.productId <= 0 ||
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0 ||
        !Number.isFinite(Number(item.price)) ||
        Number(item.price) <= 0,
    );

    if (invalidItem) {
      throw new BadRequestException('Hay un producto invalido en la orden.');
    }

    const productIds = [...new Set(items.map((item) => item.productId))];
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, stock: true },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException(
        'Uno o mas productos del carrito ya no existen. Actualiza tu carrito.',
      );
    }

    const productsById = new Map(products.map((product) => [product.id, product]));
    const itemWithoutStock = items.find((item) => {
      const product = productsById.get(item.productId);
      return product ? product.stock < item.quantity : true;
    });

    if (itemWithoutStock) {
      const product = productsById.get(itemWithoutStock.productId);
      throw new BadRequestException(
        `No hay suficiente stock para ${product?.name || 'uno de los productos'}.`,
      );
    }
  }

  async create(userId: number, dto: CreateOrderDto) {
    await this.validateOrderItems(dto.items);

    return this.prisma.order.create({
      data: {
        userId,
        total: dto.total,
        recipientName: dto.recipientName,
        streetAddress: dto.streetAddress,
        city: dto.city,
        postalCode: dto.postalCode,
        country: dto.country,
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

  async createPaypalPending(userId: number, paypalId: string, dto: CreatePaypalOrderDto) {
    await this.validateOrderItems(dto.items);

    return this.prisma.order.create({
      data: {
        userId,
        paypalId,
        total: dto.total,
        status: 'CREATED',
        recipientName: dto.recipientName,
        streetAddress: dto.streetAddress,
        city: dto.city,
        postalCode: dto.postalCode,
        country: dto.country,
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

  async updatePaypalCapture(
    userId: number,
    paypalId: string,
    amount: number,
    status: string,
    recipientName?: string | null,
    streetAddress?: string | null,
    city?: string | null,
    postalCode?: string | null,
    country?: string | null,
  ) {
    const existingOrder = await this.prisma.order.findFirst({
      where: {
        userId,
        paypalId,
      },
    });

    if (!existingOrder) {
      throw new NotFoundException('Orden de PayPal no encontrada');
    }

    return this.prisma.$transaction(async (tx) => {
      const orderItems = await tx.orderItem.findMany({
        where: { orderId: existingOrder.id },
        include: { product: true },
      });

      if (existingOrder.status !== 'COMPLETED' && status === 'COMPLETED') {
        for (const item of orderItems) {
          if (item.product.stock < item.quantity) {
            throw new BadRequestException(
              `No hay suficiente stock para ${item.product.name}.`,
            );
          }
        }

        for (const item of orderItems) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }

      return tx.order.update({
        where: { id: existingOrder.id },
        data: {
          total: amount,
          status,
          recipientName: recipientName ?? existingOrder.recipientName,
          streetAddress: streetAddress ?? existingOrder.streetAddress,
          city: city ?? existingOrder.city,
          postalCode: postalCode ?? existingOrder.postalCode,
          country: country ?? existingOrder.country,
        },
        include: { orderItems: true },
      });
    });
  }

  async findPaypalOrder(userId: number, paypalId: string) {
    return this.prisma.order.findFirst({
      where: {
        userId,
        paypalId,
      },
      include: { orderItems: true },
    });
  }

  async findByUser(userId: number) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                categoria: true,
                category: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllForAdmin() {
    return this.prisma.order.findMany({
      include: {
        orderItems: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneForAdmin(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                categoria: true,
                category: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Orden no encontrada');
    }

    return order;
  }

  async updateStatusForAdmin(id: number, status: OrderStatus) {
    const existingOrder = await this.prisma.order.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!existingOrder) {
      throw new NotFoundException('Orden no encontrada');
    }

    return this.prisma.$transaction(async (tx) => {
      const orderItems = await tx.orderItem.findMany({
        where: { orderId: id },
        include: { product: true },
      });

      if (existingOrder.status !== 'COMPLETED' && status === 'COMPLETED') {
        for (const item of orderItems) {
          if (item.product.stock < item.quantity) {
            throw new BadRequestException(
              `No hay suficiente stock para ${item.product.name}.`,
            );
          }
        }

        for (const item of orderItems) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }

      return tx.order.update({
        where: { id },
        data: { status },
        include: {
          orderItems: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    });
  }
}
