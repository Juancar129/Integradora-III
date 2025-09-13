import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { validateOrReject } from 'class-validator';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProductDto) {
    try {
      // Forzar validación de DTO
      await validateOrReject(dto);
    } catch (errors) {
      // Si hay errores, lanzamos BadRequest
      throw new BadRequestException(errors);
    }

    return this.prisma.product.create({ data: dto });
  }

  findAll() {
    return this.prisma.product.findMany();
  }

  findOne(id: number) {
    return this.prisma.product.findUnique({ where: { id } });
  }

  update(id: number, dto: UpdateProductDto) {
    return this.prisma.product.update({ where: { id }, data: dto });
  }

  delete(id: number) {
    return this.prisma.product.delete({ where: { id } });
  }
}
