import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'jwt_secret_key', // Usa la misma clave que en JwtModule.register
    });
  }

  async validate(payload: any) {
    // Aquí defines qué datos del token quieres pasar como req.user
    return { id: payload.sub, email: payload.email };
  }
}

// Guard que usarás en tus controladores para proteger rutas
import { AuthGuard } from '@nestjs/passport';

export class JwtAuthGuard extends AuthGuard('jwt') {}
