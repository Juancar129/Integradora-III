import { 
  IsString, 
  IsNumber, 
  Min, 
  IsArray, 
  ArrayMinSize,
} from 'class-validator';

export class CreateProductDto {

  @IsString()
  name: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  price: number;

  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  stock: number;

  @IsString()
  category: string;

  @IsArray()
  @IsString({ each: true }) // Cada valor debe ser string
  @ArrayMinSize(4)          // Mínimo 4 imágenes
  images: string[];
}
