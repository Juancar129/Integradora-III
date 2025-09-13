import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer'; // <-- Import necesario
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ required: true, description: 'Nombre del producto' })
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ required: true, description: 'Descripción del producto' })
  description: string;

  @IsNumber()
  @Type(() => Number)         
  @Min(0)
  @ApiProperty({ required: true, description: 'Precio del producto' })
  price: number;

  @IsNumber()
  @Type(() => Number)         
  @Min(0)
  @ApiProperty({ required: true, description: 'Cantidad en stock del producto' })
  stock: number;
}
