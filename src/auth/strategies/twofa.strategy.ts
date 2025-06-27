import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../services/auth.service';

@Injectable()
export class TwofaStrategy extends PassportStrategy(Strategy, 'twofa') {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(email: string, token: string): Promise<any> {
    return this.authService.validateTwoFa(email, token);
  }
}
