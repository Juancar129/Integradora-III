import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common'; 
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login.dto'; // Mantenemos el DTO por si se usa en otro lugar
import { Prisma } from '@prisma/client'; // Importamos solo lo necesario


@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * Registra un nuevo usuario en la base de datos.
   */
  async register(dto: CreateUserDto) {
    
    // 1. Asignamos el rol por defecto.
    const userRole = dto.role || 'user'; 

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    try {
      // 2. CREACIÓN DE USUARIO
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          name: dto.name, 
          password: hashedPassword, // Usamos la contraseña hasheada
          role: userRole, 
          active: true,
        },
      });

      const token = this.jwtService.sign({ 
        email: user.email, 
        sub: user.id,
        role: user.role, 
      });

      return {
        access_token: token,
      };

    } catch (error) {
      console.error('Error durante el registro de usuario:', error); 

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('El correo electrónico ya está registrado.');
        }
      }

      throw error;
    }
  }

  /**
   * Valida un usuario por su email y contraseña.
   * 💡 MÉTODO USADO EXCLUSIVAMENTE POR LA LocalStrategy.
   */
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    // 1. Verificar si el usuario existe
    if (!user) return null;

    // 2. Verificar la contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return null;

    // 3. Retornar el usuario sin la contraseña
    const { password: _password, ...result } = user;
    return result;
  }


  /**
   * Genera el token JWT para un usuario que ya fue validado.
   * 💡 MÉTODO LLAMADO POR EL AUTH CONTROLLER.
   */
  signToken(user: any) {
    const payload = {
      email: user.email,
      sub: user.id, // Asumimos 'id' es la clave de usuario
      role: user.role, 
    };

    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
    };
  }
}