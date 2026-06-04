import { Module } from '@nestjs/common';
import { ConektaController } from './conekta.controller';
import { ConektaService } from './conekta.service';

@Module({
  controllers: [ConektaController],
  providers: [ConektaService],
  exports: [ConektaService],
})
export class ConektaModule {}
