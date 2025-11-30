import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common'; // Agregamos ConflictException
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login.dto';
import { PrismaClient, Prisma } from '@prisma/client' 


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
    
  
    if (!dto.role) {
        dto.role = 'user'; 
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    try {
        // 2. CREACIÓN DE USUARIO: Usamos spread operator para incluir name, email, y el role asignado.
        const user = await this.prisma.user.create({
          data: {
            ...dto, // Incluye todos los campos del DTO (incluyendo el role asignado)
            password: hashedPassword, // Sobrescribe con la contraseña hasheada
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
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      throw new ConflictException('El correo electrónico ya está registrado.');
    }
  }

  throw error;
}

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