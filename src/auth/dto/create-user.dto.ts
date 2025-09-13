import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class CreateUserDto {
  @ApiProperty({ required: true, description: 'Nombre de usuario' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: true, description: 'Correo electrónico del usuario' })
  @IsEmail()
  email: string;

  @ApiProperty({ required: true, description: 'Contraseña del usuario' })
  @IsString()
  @MinLength(6)
  password: string;


    @ApiProperty({ required: true, description: 'rol de usuario' })
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  role: string;
}

