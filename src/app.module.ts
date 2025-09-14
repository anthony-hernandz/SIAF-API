import { Module } from '@nestjs/common';
import { DatabaseModule } from '@database/database.module';
import { FilesModule } from '@files/files.module';
import { AuthModule } from '@auth/auth.module';
import { EmailModule } from '@email/email.module';
import { BitacoraModule } from './bitacora/bitacora.module';
import { UsersModule } from '@users/users.module';
import { ModulesModule } from '@modules/modules.module';
import { CommonModule } from '@common/common.module';
import { EstablecimientosModule } from './administracion/establecimientos/establecimientos.module';
import { TipoActivoModule } from './administracion/catalogs/tipo_activos/tipo_activos.module';
import { TipofinanciamientoModule } from './administracion/catalogs/tipofinanciamiento/tipofinanciamiento.module';
import { DependenciaModule } from './dependencia/dependencia.module';
import { GrupoModule } from './administracion/catalogs/grupo/grupo.module';
import { ClaseModule } from './administracion/catalogs/clase/clase.module';
import { SubclaseModule } from './administracion/catalogs/subclase/subclase.module';


@Module({
  imports: [
    DatabaseModule,
    FilesModule,
    AuthModule,
    EmailModule,
    BitacoraModule,
    UsersModule,
    ModulesModule,
    CommonModule,
    EstablecimientosModule,
    TipoActivoModule,
    TipofinanciamientoModule,
    DependenciaModule,
    GrupoModule,
    ClaseModule,
    SubclaseModule,

  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
