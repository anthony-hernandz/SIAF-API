import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { Public } from '@auth/decorators/public.decorator';
import { AuthService } from '@auth/services/auth.service';
import { MntUsers } from '@users/entities';
import { loginDTO } from '@auth/dtos/login.dto';
import { PermissionsService } from '@auth/services/permissions.service';
import { IChangePassword } from '@users/interfaces/change-password.interface';
import { UsersService } from '@users/services/users.service';
import { IRestorePassword } from '@auth/interfaces/restore-password.interface';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly permissionService: PermissionsService,
    private readonly usersService: UsersService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @ApiBody({
    type: loginDTO,
  })
  @Public()
  @UseGuards(AuthGuard('local'))
  @Post('login')
  login(@Req() req: Request) {
    return this.authService.login(req.user as MntUsers);
  }

  @Public()
  @Post('logout')
  logout(@Body() data: any) {
    return this.authService.logout(data);
  }

  @Post('/has-permission')
  hassPermission(@Body() data: string[]) {
    return this.permissionService.hassPermission(data);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('/recover-password')
  recuperarPassword(@Ip() ip: string, @Body() body: any) {
    return this.authService.recoverPassword(body.email, ip);
  }

  @Public()
  @HttpCode(HttpStatus.ACCEPTED)
  @Post('/reset-password')
  reestablecerPassword(@Body() data: IRestorePassword) {
    return this.authService.verifyRecoverPassword(data['tokenNombre']);
  }

  @Public()
  @HttpCode(HttpStatus.ACCEPTED)
  @Post('/change-password-reset/')
  changePasswordReset(@Body() payload: IChangePassword) {
    return this.usersService.changePasswordReset(payload);
  }

  @Public()
  @HttpCode(HttpStatus.ACCEPTED)
  @Post('/change-password-reset-by-user/')
  changePasswordResetByUser(@Body() payload: IChangePassword) {
    return this.usersService.changePasswordResetByUser(payload);
  }

  @Public()
  @Post('verify-otp')
  async verifyTwoFa(@Body() data: any) {
    return this.authService.validateTwoFa(data.email, data.code);
  }

  @Public()
  @Put('twofa/secret')
  async getTwoFaSecret(@Body() data: any) {
    return this.authService.generateTwoFaSecret(data.email);
  }
}
