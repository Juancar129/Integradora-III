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
    // Crea la carpeta de subidas si no existe
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
  }

  // 🛑 MODIFICADO: Ahora acepta 'files'
  async create(data: CreateProductDto, files: Array<Express.Multer.File>) {
    
    // 1. Guardar archivos localmente y obtener las rutas
    const imagePaths = files.map(file => {
      // Crea un nombre de archivo único
      const filename = `${Date.now()}-${file.originalname}`;
      const filePath = path.join(UPLOADS_DIR, filename);

      // Escribe el archivo al disco desde el buffer de Multer
      fs.writeFileSync(filePath, file.buffer);

      // Almacenamos la ruta relativa que será accesible por HTTP
      return `/uploads/${filename}`; 
    });

    // 2. Crear el producto e insertar las rutas de las imágenes en la DB
    return this.prisma.product.create({
      data: {
        ...data, // name, price, description, etc.
        images: {
          create: imagePaths.map(path => ({ url: path })), // Usamos 'url' para almacenar la ruta
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
  
  // ... (El resto de los métodos)
  
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
    
    // Aquí puedes incluir la lógica de actualización de imágenes si es necesario
    
    // ... rest of the update logic
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
    // Nota: Deberías incluir lógica para borrar los archivos físicos de la carpeta 'uploads'
    return this.prisma.product.delete({
      where: { id },
    });
  }
  
  async getSimilarProducts(productId: number) {
    const product = await this.findOne(productId);

    if (!product.category) return [];

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