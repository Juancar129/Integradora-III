import { IsInt, IsPositive } from 'class-validator';
import { ApiProperty } from "@nestjs/swagger";

export class CreateOrderItemDto {
  @IsInt()
  @ApiProperty({ required: true, description: 'ID del producto' })
  productId: number;

  @IsInt()
  @IsPositive()
  @ApiProperty({ required: true, description: 'Cantidad del producto' })
  quantity: number;

  @IsInt()
  @IsPositive()
  @ApiProperty({ required: true, description: 'Precio del producto' })
  price: number;
}
