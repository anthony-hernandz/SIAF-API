import { Global, Module } from '@nestjs/common';
import { classSessionUser } from '@common/class/userSession.class';

@Global()
@Module({
  providers: [classSessionUser],
  exports: [classSessionUser],
})
export class CommonModule {}
