import { IsInt, IsPositive, IsNumber } from 'class-validator';
import { ApiProperty } from "@nestjs/swagger";

export class CreateOrderItemDto {
  @IsInt()
  @ApiProperty({ required: true, description: 'ID del producto' })
  productId: number;

  @IsInt()
  @IsPositive()
  @ApiProperty({ required: true, description: 'Cantidad del producto' })
  quantity: number;

  @IsNumber() // Usamos IsNumber si el precio puede tener decimales.
  @IsPositive()
  @ApiProperty({ required: true, description: 'Precio del producto' })
  price: number;
}