import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@auth/auth.module';
import { MntRestoreAccount, MntRolUser, MntUsers } from './entities';
import { UsersService } from './services/users.service';
import { ModulesModule } from '@modules/modules.module';
import { usersControllers } from 'src/users/controllers';
import { userServices } from 'src/users/services';
import { RestoreAccountService } from './services/restore-account.service';
import { EmailModule } from '@email/email.module';
import { CtlPaises } from 'src/administracion/catalogs/entities/paises.entity';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    forwardRef(() => ModulesModule),
    TypeOrmModule.forFeature([
      MntUsers,
      MntRolUser,
      MntRestoreAccount,
      CtlPaises,
    ]),
    EmailModule,
  ],
  controllers: [
    // Importar controladores necesarios para el manejo de usuarios
    ...usersControllers,
  ],
  providers: [...userServices],
  exports: [UsersService, RestoreAccountService],
})
export class UsersModule {}
