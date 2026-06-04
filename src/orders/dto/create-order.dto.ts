import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';
import { CreateOrderItemDto } from './create-order-item.dto';

export class CreateOrderDto {
  @IsNumber()
  @ApiProperty({ required: true, description: 'Costo total de la orden' })
  total: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  @ApiProperty({ type: [CreateOrderItemDto], description: 'Lista de items de la orden' })
  items: CreateOrderItemDto[];

  @IsString()
  @ApiProperty({ required: true, description: 'Nombre del destinatario' })
  recipientName: string;

  @IsString()
  @ApiProperty({ required: true, description: 'Calle y numero' })
  streetAddress: string;

  @IsString()
  @ApiProperty({ required: true, description: 'Ciudad' })
  city: string;

  @IsString()
  @ApiProperty({ required: true, description: 'Codigo Postal' })
  postalCode: string;

  @IsString()
  @ApiProperty({ required: true, description: 'Pais/Region' })
  country: string;
}
