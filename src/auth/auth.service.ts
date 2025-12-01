import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common'; 
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
    
  // 1. Asignamos el rol por defecto. Si el DTO no tiene 'role', se establece 'user'.
  const userRole = dto.role || 'user'; 

  const hashedPassword = await bcrypt.hash(dto.password, 10);

    try {
        // 2. CREACIÓN DE USUARIO: Construcción explícita de `data` (CORRECCIÓN CLAVE)
   const user = await this.prisma.user.create({
    data: {
      // 🛑 REEMPLAZAMOS `...dto` por los campos explícitos de la tabla `User`
      email: dto.email,
      name: dto.name, // 👈 Asumimos que 'name' es un campo requerido. ¡Asegúrate de que todos los campos requeridos estén aquí!
      password: hashedPassword, // Usamos la contraseña hasheada
      role: userRole, // Usamos el rol asignado
      active: true,
     },
   });

    const token = this.jwtService.sign({ 
     email: user.email, 
     sub: user.id,
     role: user.role, 
    });

    return {
    access_token: token,    };

} catch (error) {
  // 3. Logueamos el error en la consola del backend para debugging (CRUCIAL)
  console.error('Error durante el registro de usuario:', error); 

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      // Error de unicidad (el email ya existe)
      throw new ConflictException('El correo electrónico ya está registrado.');
    }
    // Aquí se capturan otros errores como Not Null (P2003, etc.)
  }

  throw error;
}

 }

 /**
   * Inicia sesión validando credenciales de un usuario.
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