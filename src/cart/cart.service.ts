import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  /**
   * Obtiene el carrito de un usuario, incluyendo los productos asociados.
   * @param {number} userId - ID del usuario dueño del carrito.
   * @returns {Promise<object|null>} El carrito con sus productos, o null si no existe.
   */
  async getCart(userId: number) {
    return this.prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });
  }

  /**
   * Agrega un producto al carrito de un usuario.
   * @param {number} userId - ID del usuario dueño del carrito.
   * @param {number} productId - ID del producto a agregar.
   * @returns {Promise<void>} 
   */
  async addProduct(userId: number, productId: number) {
    // Implementación pendiente
  }

  /**
   * Elimina un producto del carrito de un usuario.
   * @param {number} userId - ID del usuario dueño del carrito.
   * @param {number} productId - ID del producto a eliminar.
   * @returns {Promise<void>} 
   */
  async removeProduct(userId: number, productId: number) {
    // Implementación pendiente
  }
}
