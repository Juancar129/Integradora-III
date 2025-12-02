import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete,
  UseInterceptors,
  UploadedFiles,
  UseGuards 
} from '@nestjs/common';

import { FilesInterceptor } from '@nestjs/platform-express';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; 
// import { RolesGuard } from '../auth/guards/roles.guard';
// import { Roles } from '../auth/decorators/roles.decorator';

import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';


// para que el tipado 'Express.Multer.File' funcione correctamente.

@Controller('products')
export class ProductsController {
 constructor(private readonly productsService: ProductsService) {}

 @Post()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('admin')

  @UseInterceptors(FilesInterceptor('images', 5)) 
 create(
    @Body() data: CreateProductDto, 

    @UploadedFiles() files: Array<Express.Multer.File>
  ) {

  return this.productsService.create(data, files); 
 }

  // ... (El resto de los métodos se mantiene igual)
 @Get()
 findAll() {
  return this.productsService.findAll();
 }

 @Get(':id')
 findOne(@Param('id') id: string) {
  return this.productsService.findOne(Number(id));
 }

 @Patch(':id')
 update(@Param('id') id: string, @Body() data: UpdateProductDto) {
  return this.productsService.update(Number(id), data);
 }

 @Delete(':id')
 remove(@Param('id') id: string) {
  return this.productsService.remove(Number(id));
 }

 @Get(':id/similar')
 getSimilar(@Param('id') id: string) {
  return this.productsService.getSimilarProducts(Number(id));
 }
}