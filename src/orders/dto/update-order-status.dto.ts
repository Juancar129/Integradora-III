import { IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export const ORDER_STATUSES = [
  'CREATED',
  'PENDING',
  'COMPLETED',
  'ENVIADO',
  'CANCELADO',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export class UpdateOrderStatusDto {
  @IsIn(ORDER_STATUSES)
  @ApiProperty({ enum: ORDER_STATUSES, description: 'Nuevo estado de la orden' })
  status: OrderStatus;
}
