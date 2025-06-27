import { RolsService } from 'src/users/services/rols.service';
import { UsersService } from 'src/users/services/users.service';
import { RestoreAccountService } from 'src/users/services/restore-account.service';

export const userServices = [UsersService, RolsService, RestoreAccountService];
