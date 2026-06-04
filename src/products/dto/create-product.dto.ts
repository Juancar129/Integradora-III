import { 
    IsString, 
    IsNumber, 
    Min, 
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

    // 1. Campo para la lógica de negocio y filtro (ya existía)
    @IsString()
    category: string; 

    
    @IsString()
    categoria: string; 
}