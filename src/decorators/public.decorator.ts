import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY= 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);


/// src/guards/jwt-auth.guard.ts
