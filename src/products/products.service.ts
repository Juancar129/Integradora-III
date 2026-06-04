import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import * as fs from 'fs';
import * as path from 'path';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
  }

  async create(data: CreateProductDto, files: Array<Express.Multer.File>) {
    const uploadedFiles = files ?? [];
    const imagePaths = uploadedFiles.map(file => {
      const filename = `${Date.now()}-${file.originalname}`;
      const filePath = path.join(UPLOADS_DIR, filename);

      fs.writeFileSync(filePath, file.buffer);

      return `/uploads/${filename}`;
    });

    return this.prisma.product.create({
      data: {
        ...data,
        images: {
          create: imagePaths.map(imagePath => ({ url: imagePath })),
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

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    return product;
  }

  async update(id: number, data: UpdateProductDto) {
    await this.findOne(id);

    return this.prisma.product.update({
      where: { id },
      data: {
        ...data,
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

    if (!product.category) {
      return [];
    }

    return this.prisma.product.findMany({
      where: {
        category: product.category,
        NOT: { id: productId },
      },
      take: 4,
      include: { images: true },
    });
  }
}
