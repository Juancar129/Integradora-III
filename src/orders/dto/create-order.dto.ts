import { IsArray, IsNumber } from 'class-validator';
import { CreateOrderItemDto } from './create-order-item.dto';
import { ApiProperty } from "@nestjs/swagger";

export class CreateOrderDto {
  @IsNumber()
  @ApiProperty({ required: true, description: 'ID del cliente' })
  total: number;

  @IsArray()
  @ApiProperty({ type: [CreateOrderItemDto], description: 'Lista de items de la orden' })
  items: CreateOrderItemDto[];
}
