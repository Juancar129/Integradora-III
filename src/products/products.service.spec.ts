import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ProductsService', () => {
  let service: ProductsService;

  const mockPrisma = {
    product: {
      create: jest.fn().mockResolvedValue({
        id: 1,
        name: 'Test product',
        description: 'A test product',
        price: 100,
        stock: 10,
      }),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should create a product', async () => {
    const mockProduct = {
      name: 'Test product',
      description: 'A test product',
      price: 100,
      stock: 10,
    };

    const createdProduct = await service.create(mockProduct);
    expect(createdProduct).toHaveProperty('id');
    expect(createdProduct.name).toBe(mockProduct.name);
  });
});
