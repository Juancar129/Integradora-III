import { Controller, Get, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';    // Ruta corregida
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Ruta corregida

@Controller('users')
export class UsersController {
  
  @Get('admin-data')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  getAdminData() {
    return "Solo el admin puede ver esto.";
  }
}