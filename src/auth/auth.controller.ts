import { Controller, Post, Body, HttpCode, UseGuards, Request, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
// Asegúrate de importar AuthGuard de @nestjs/passport
import { AuthGuard } from '@nestjs/passport'; 
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
// No necesitamos LoginUserDto aquí si usamos Passport

@ApiBearerAuth()
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  // 1. Usamos AuthGuard('local') para validar credenciales (LocalStrategy)
  @UseGuards(AuthGuard('local')) 
  @Post('login')
  @HttpCode(200)
  // 2. El decorador @Request() nos da acceso a req.user (adjuntado por la Strategy)
  async login(@Request() req) { 
    this.logger.log(`Usuario autenticado, generando token para: ${req.user.email}`);
    
    
    return this.authService.signToken(req.user); 
  }
}