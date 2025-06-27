import {
  forwardRef,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TokenMiddleware } from './middlewares/token.middleware';
import { UsersModule } from '@users/users.module';
import { AuthService } from './services/auth.service';
import { TokenService } from './services/token.service';
import { authEntities } from './entities';
import { PermissionsService } from './services/permissions.service';
import { AuthController } from './controllers/auth.controller';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ModulesModule } from '@modules/modules.module';
import { EmailModule } from '@email/email.module';
import { TwofaStrategy } from './strategies/twofa.strategy';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => ({}),
    }),
    TypeOrmModule.forFeature([...authEntities]),
    forwardRef(() => UsersModule),
    EmailModule,
    PassportModule,
    ModulesModule,
  ],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    TokenService,
    PermissionsService,
    TwofaStrategy,
  ],
  controllers: [AuthController],
  exports: [AuthService, PermissionsService],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TokenMiddleware)
      .forRoutes({ path: '/*', method: RequestMethod.ALL });
  }
}
