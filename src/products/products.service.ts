import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  // Crear producto
  create(data: CreateProductDto) {
    return this.prisma.product.create({ data });
  }

  // Obtener todos los productos
  async findAll() {
    return this.prisma.product.findMany();
  }

  // Obtener producto por ID
  findOne(id: number) {
    return this.prisma.product.findUnique({
      where: { id },
    });
  }

  // Actualizar producto
  update(id: number, data: UpdateProductDto) {
    return this.prisma.product.update({
      where: { id },
      data,
    });
  }

  // Eliminar producto
  remove(id: number) {
    return this.prisma.product.delete({ where: { id } });
  }

  // 🔥 Productos similares por categoría
  async getSimilarProducts(productId: number) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || !product.categoria) return [];

    return this.prisma.product.findMany({
      where: {
        categoria: product.categoria,
        NOT: { id: productId },
      },
      take: 4, // solo 4 productos similares
    });
  }
}
