import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * Registra un nuevo usuario en la base de datos.
   * @param {CreateUserDto} dto - Datos del usuario a registrar.
   * @returns {Promise<{ access_token: string }>} Token JWT del usuario registrado.
   */
  async register(dto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
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
  }

  /**
   * Inicia sesión validando credenciales de un usuario.
   * @param {LoginUserDto} dto - Credenciales de acceso del usuario.
   * @throws {UnauthorizedException} Si el usuario no existe o la contraseña no coincide.
   * @returns {Promise<{ access_token: string }>} Token JWT del usuario autenticado.
   */
  async login(dto: LoginUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) throw new UnauthorizedException('Credenciales incorrectas');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Credenciales incorrectas');

    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,  
    };

    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
    };
  }

  /**
   * Valida un usuario por su email y contraseña.
   * @param {string} email - Correo electrónico del usuario.
   * @param {string} password - Contraseña del usuario.
   * @returns {Promise<object|null>} El usuario sin la contraseña si es válido, o null en caso contrario.
   */
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) return null;

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return null;

    const { password: _password, ...result } = user;
    return result;
  }
}
