import { MntRolUser } from '@users/entities';

export interface IToken {
  rol: MntRolUser;
  sub: string;
}
