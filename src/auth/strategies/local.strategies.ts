import { Injectable, UnauthorizedException } from "@nestjs/common";
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from "../auth.service";


@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy){
    constructor(private authService: AuthService){
        super();
    }

    async validate(username: string, password: string): Promise<any>{
        const user = await this.authService.validateUser(username, password);
        if (!user) {
            console.log('Usuario no válido');
            throw new UnauthorizedException();
        }
        console.log('Usuario válido', user);
        return user;
    }
}