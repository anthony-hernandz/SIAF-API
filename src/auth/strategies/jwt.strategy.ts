import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

import { envs } from '@config/envs';
import { classSessionUser } from '@common/class/userSession.class';
import { IToken } from '../interfaces/token.interface';
import { PermissionsService } from '@auth/services/permissions.service';
import { UsersService } from '@users/services/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly permissionsService: PermissionsService,
    private sessionUser: classSessionUser,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: envs.jwtSecret,
      passReqToCallback: true,
      ignoreExpiration: false,
    });
  }

  // Se cambio el tipo de retorno de 'boolean' a 'any' para poder devolver el ID del usuario activo
  async validate(request: Request, payload: IToken): Promise<any> {
    const idUser: string = payload['sub'];

    const endpoint: string = request.route.path;
    const method: string = request.method;
    const user = await this.usersService.findOne(idUser);
    // storage class global
    this.sessionUser.idUser = idUser;
    this.sessionUser.idEstablecimiento = user.establecimiento.id.toString();
    this.sessionUser.idRol = user.rol.id.toString();
    await this.permissionsService.findPermissionsToUser(
      idUser,
      endpoint,
      method,
    );

    // Devuelve el ID del usuario usarlo en los controllers y services
    return {
      id: user.id
    };
  }
}
