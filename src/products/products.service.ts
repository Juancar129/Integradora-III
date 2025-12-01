import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

 
  async create(data: CreateProductDto) {
    const { images, ...rest } = data;

    return this.prisma.product.create({
      data: {
        ...rest,
        images: {
          create: images.map(url => ({ url })),
        },
      },
      include: { images: true },
    });
  }

  findAll() {
    return this.prisma.product.findMany({
      include: { images: true },
    });
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!product) throw new NotFoundException('Producto no encontrado');
    return product;
  }


  async update(id: number, data: UpdateProductDto) {
    await this.findOne(id);

    const { images, ...rest } = data;

    return this.prisma.product.update({
      where: { id },
      data: {
        ...rest,
        // Solo actualiza imágenes si vienen en el DTO
        ...(images && {
          images: {
            deleteMany: {}, // Borra las imágenes anteriores
            create: images.map(url => ({ url })), // Inserta las nuevas
          },
        }),
      },
      include: { images: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.product.delete({
      where: { id },
    });
  }

  async getSimilarProducts(productId: number) {
    const product = await this.findOne(productId);

    if (!product.categoria) return [];

    return this.prisma.product.findMany({
      where: {
        categoria: product.categoria,
        NOT: { id: productId },
      },
      take: 4,
      include: { images: true },
    });
  }
}
