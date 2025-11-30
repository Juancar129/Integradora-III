import { Controller, Get, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';    // Ruta corregida
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Ruta corregida
import { Request } from '@nestjs/common';


@Controller('users')
export class UsersController {
  
  @Get('admin-data')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  getAdminData() {
    return "Solo el admin puede ver esto.";
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}