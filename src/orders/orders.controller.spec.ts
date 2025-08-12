import { Test, TestingModule } from "@nestjs/testing";
import { OrdersController } from "./orders.controller";
import { OrdersService } from "./orders.service";
import { PrismaService } from "../prisma/prisma.service";
import { Order, OrderItem } from "@prisma/client";
import { CreateOrderDto } from "./dto/create-order.dto";
import { Request } from 'express';

type OrderWithItems = Order & {
  orderItems: OrderItem[];
};

const mockRequest = {
  user: {
    userId: 1
  }
} as unknown as Request;

describe('OrdersController', () => {
  let controller: OrdersController;
  let ordersService: OrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        OrdersService,
        {
          provide: PrismaService,
          useValue: {}, 
        },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
    ordersService = module.get<OrdersService>(OrdersService);
  });

  it('El controlador debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('El servicio debe estar definido', () => {
    expect(ordersService).toBeDefined();
  });

  describe('findAll', () => {
    it('debe retornar las órdenes del usuario', async () => {
      const mockOrders: OrderWithItems[] = [
        {
          id: 1,
          userId: 1,
          total: 100,
          createdAt: new Date(),
          orderItems: [
            {
              id: 1,
              productId: 1,
              quantity: 2,
              price: 50,
              orderId: 1,
            }
          ],
        },
      ];

      jest.spyOn(ordersService, 'findByUser').mockImplementation(async () => mockOrders);

      const result = await controller.findAll(mockRequest);
      expect(result).toEqual(mockOrders);
      expect(ordersService.findByUser).toHaveBeenCalledWith(1); // userId del mockRequest
    });
  });

  describe('create', () => {
    it('debe crear una nueva orden', async () => {
      const mockOrder: OrderWithItems = {
        id: 1,
        userId: 1,
        total: 100,
        createdAt: new Date(),
        orderItems: [
          {
            id: 1,
            productId: 1,
            quantity: 2,
            price: 50,
            orderId: 1,
          }
        ],
      };

      const createDto: CreateOrderDto = {
        total: 100,
        items: [
          {
            productId: 1,
            quantity: 2,
            price: 50,
          }
        ]
      };

      jest.spyOn(ordersService, 'create').mockImplementation(async () => mockOrder);

      const result = await controller.create(mockRequest, createDto);
      expect(result).toEqual(mockOrder);
      expect(ordersService.create).toHaveBeenCalledWith(1, createDto); // userId del mockRequest
    });
  });
});