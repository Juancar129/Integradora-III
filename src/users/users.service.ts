import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from '../auth/dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crea un nuevo usuario en la base de datos.
   * @param {CreateUserDto} data - Datos del usuario a crear.
   * @returns {Promise<object>} El usuario creado.
   */
  async create(data: CreateUserDto) {
    return this.prisma.user.create({
      data,
    });
  }

  /**
   * Busca un usuario por su correo electrónico.
   * @param {string} email - Correo electrónico del usuario.
   * @returns {Promise<object|null>} El usuario encontrado o null si no existe.
   */
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }
}
