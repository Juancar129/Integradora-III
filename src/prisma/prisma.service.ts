import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect(); 
    // Conecta con la base de datos al iniciar
  }

  async onModuleDestroy() {
    await this.$disconnect(); 
  }
}

//controlador de ejemplo
//modulo de servicios   