import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; 
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}


  async create(createProductDto: CreateProductDto) {
    // Extraemos las imágenes para crearlas aparte en la relación
    const { images, ...productData } = createProductDto;

    const product = await this.prisma.product.create({
      data: {
        ...productData, // Incluye name, price, stock, description, category
        
        // Relación para crear las entradas en ProductImage
        images: {
          create: images.map(url => ({ url })), 
        },
      },
      // Incluir las imágenes en la respuesta final
      include: { 
          images: true 
      }
    });

    return product;
  }

  // 🟢 FUNCIÓN findOne: Incluye imágenes
  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { 
          images: true 
      } 
    });

    if (!product) {
        throw new Error(`Product with ID ${id} not found`);
    }
    return product;
  }

  // 🟢 FUNCIÓN findAll: Incluye imágenes
  async findAll() {
    return this.prisma.product.findMany({
        include: { 
            images: true 
        }
    });
  }

  // ⚠️ NOTA: La función update también debe actualizarse para manejar las imágenes
  async update(id: number, updateProductDto: UpdateProductDto) {
    const { images, ...productData } = updateProductDto;

    return this.prisma.product.update({
        where: { id },
        data: {
            ...productData,
         
            ...(images && {
                images: {
                    deleteMany: {}, 
                    create: images.map(url => ({ url })),
                }
            })
        },
        include: { images: true }
    });
  }

  async remove(id: number) {
    return this.prisma.product.delete({ where: { id } });
  }

}