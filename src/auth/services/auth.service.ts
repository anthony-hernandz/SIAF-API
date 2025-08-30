import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as moment from 'moment-timezone';
import { envs } from '@config/envs';

import { UsersService } from '@users/services/users.service';
import { MntUsers } from '@users/entities';
import { TokenService } from './token.service';
import { IToken } from '../interfaces/token.interface';
import { IRefreshToken } from '../interfaces/refreshToken.interface';
import { IAuthUser } from '@auth/interfaces/authUser.interface';
import { RestoreAccountService } from '@users/services/restore-account.service';
import { EmailService } from '@email/services/email.service';
import { classSessionUser } from '@common/class/userSession.class';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly tokenService: TokenService,
    private readonly restoreAccountService: RestoreAccountService,
    private readonly emailService: EmailService,
    private sessionUser: classSessionUser,
  ) {}

  async validateUser(email: string, password: string): Promise<MntUsers> {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.active) {
      throw new UnauthorizedException('Usuario no encontrado o inactivo');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Contraseña incorrecta');
    }
    return user;
  }

  async login(user: MntUsers) {
    const secret = await this.generateTwoFaSecret(user.email);

    if (secret) {
      return { logged: true };
    }
  }

  async logout(user: MntUsers): Promise<void> {
    await this.tokenService.desactiveTokensByUser(user.id);
  }

  private formatUser(user: MntUsers) {
    // Realiza la conversión de tipo
    const infoUser: IAuthUser = {
      id: user.id,
      email: user.email,
      nombres: user.primerNombre,
      apellidos: user.primerApellido,
      tipo_usuario: {
        id: user.rol.id,
        nombre: user.rol.name,
      },
    };

    return infoUser;
  }

  async recoverPassword(email: string, ip: string) {
    const user = await this.usersService.findByEmail(email);
    const url = await this.restoreAccountService.create(
      user,
      ip,
      '/restablish-password?token=',
    );
    await this.emailService.sendEmail(
      user.email,
      'Restablecer contraseña',
      'templateRecuperar',
      {
        name: user.email,
        url: url,
      },
      [
        {
          filename: 'Logo_SIAF.png',
          path: __dirname + '/../../../static/Logo_SIAF.png',
          cid: 'logo',
        },
      ],
    );

    return {
      segundos: envs.emailRecoverPasswordTime,
    };
  }

  async verifyRecoverPassword(token: string) {
    return await this.restoreAccountService.searchToken(token);
  }

  async generateTwoFaSecret(email: string): Promise<string> {
    let result: string = '';
    const abc = [];
    for (let i = 0; i < 9; i++) {
      abc.push(i.toString());
    }
    for (let i = 0; i < 6; i++) {
      const random = Math.floor(Math.random() * abc.length);
      result += abc[random];
    }

    const secret = result;
    await this.usersService.updateTwoFaSecret(email, secret);
    return secret;
  }

  async validateTwoFa(email: string, secret: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.secretKey) {
      throw new UnauthorizedException();
    }
    if (user.secretKey != secret) {
      throw new UnauthorizedException();
    }
    try {
      const dataToken: IToken = { rol: user.rol, sub: user.id };
      const token = await this.tokenService.createJWTToken(
        dataToken,
        envs.jwtExpiration,
        envs.jwtSecret,
      );

      // olds tokens
      await this.tokenService.desactiveTokensByUser(user.id);

      const { amount, unit } = this.tokenService.parseExpirationJwt(
        envs.jwtExpiration,
      );

      const savedToken = await this.tokenService.create({
        userId: user.id,
        token,
        expirationTime: moment()
          .tz('America/El_Salvador')
          .add(amount, unit)
          .format(),
      });

      let refreshToken: string = '';
      if (envs.jwtUseRefreshToken) {
        const dataRefreshToken: IRefreshToken = {
          rol: user.rol + token,
          sub: user.id + token,
        };

        refreshToken = await this.tokenService.createJWTToken(
          dataRefreshToken,
          envs.jwtRefreshExpiration,
          envs.jwtSecret,
        );

        const { amount, unit } = this.tokenService.parseExpirationJwt(
          envs.jwtRefreshExpiration,
        );

        await this.tokenService.update(savedToken.token, {
          userId: user.id,
          refreshToken: refreshToken,
          refreshExpirationTime: moment()
            .tz('America/El_Salvador')
            .add(amount, unit)
            .format(),
        });
      }

      this.sessionUser.idUser = user.id;
      this.sessionUser.idEstablecimiento = user.establecimiento.id.toString();

      return {
        user: this.formatUser(user),
        token,
        refreshToken,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
