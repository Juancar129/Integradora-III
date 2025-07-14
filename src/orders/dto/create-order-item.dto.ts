//se define el Dto para crear un item de orden
import { IsInt, IsPositive } from 'class-validator';

export class CreateOrderItemDto {
  @IsInt()
  productId: number;

  @IsInt()
  @IsPositive()
  quantity: number;

  @IsInt()
  @IsPositive()
  price: number;
}
