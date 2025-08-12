import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; 
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { ProjectsModule } from './Projects/projects.module';
import { CartModule } from './cart/cart.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ProjectsModule,
    AuthModule,
    ProductsModule, 
    OrdersModule,
    CartModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
