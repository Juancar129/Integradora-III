import { IsArray, IsNumber, IsString } from 'class-validator'; // <-- ¡Asegúrate de importar IsString!
import { CreateOrderItemDto } from './create-order-item.dto';
import { ApiProperty } from "@nestjs/swagger";

export class CreateOrderDto {
  @IsNumber()
  @ApiProperty({ required: true, description: 'Costo total de la orden' })
  total: number; 

  @IsArray()
  @ApiProperty({ type: [CreateOrderItemDto], description: 'Lista de items de la orden' })
  items: CreateOrderItemDto[];

  // 💡 CAMPOS DE ENVÍO AÑADIDOS
  @IsString()
  @ApiProperty({ required: true, description: 'Nombre del destinatario' })
  recipientName: string;

  @IsString()
  @ApiProperty({ required: true, description: 'Calle y número' })
  streetAddress: string;
  
  @IsString()
  @ApiProperty({ required: true, description: 'Ciudad' })
  city: string;
  
  @IsString()
  @ApiProperty({ required: true, description: 'Código Postal' })
  postalCode: string;
  
  @IsString()
  @ApiProperty({ required: true, description: 'País/Región' })
  country: string;
}