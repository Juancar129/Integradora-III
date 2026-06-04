import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy'; // 💡 IMPORTACIÓN FALTANTE
import { jwtConstants } from './constants';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [
    AuthService, 
    JwtStrategy, 
    LocalStrategy, // 💡 CORRECCIÓN CLAVE: Agregando la estrategia local
    PrismaService
],
  controllers: [AuthController],
  exports: [AuthService, JwtModule] // Sugerencia: Mantenemos la exportación por si otros módulos la necesitan
})
export class AuthModule {}