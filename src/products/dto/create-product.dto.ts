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

  4
    @IsArray()
    @IsString({ each: true }) // Asegura que cada elemento es una URL string
    @ArrayMinSize(4) // Valida que haya un mínimo de 4 imágenes
    images: string[]; 
}