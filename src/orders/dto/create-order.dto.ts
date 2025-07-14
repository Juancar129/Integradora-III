//se define el deto para crear una orden
import { IsArray, IsNumber } from 'class-validator';
import { CreateOrderItemDto } from './create-order-item.dto';

export class CreateOrderDto {
  @IsNumber()
  total: number;

  @IsArray()
  items: CreateOrderItemDto[];
}
