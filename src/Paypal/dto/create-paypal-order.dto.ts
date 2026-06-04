import { IsNumber, IsArray, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateOrderItemDto } from '../../orders/dto/create-order-item.dto'; 


export class CreatePaypalOrderDto {
  // Campos de la orden
  @IsNumber()
  @ApiProperty({ description: 'Monto total de la orden' })
  total: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  @ApiProperty({ type: [CreateOrderItemDto], description: 'Lista de productos' })
  items: CreateOrderItemDto[];

  // Campos de envío
  @IsString()
  @ApiProperty()
  recipientName: string;
  
  @IsString()
  @ApiProperty()
  streetAddress: string;

  @IsString()
  @ApiProperty()
  city: string;

  @IsString()
  @ApiProperty()
  postalCode: string;

  @IsString()
  @ApiProperty()
  country: string;
}