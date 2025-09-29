import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController, UsersController } from './user.controller';
import { OnlineService } from 'src/user/online.service';

@Module({
  controllers: [UserController, UsersController],
  providers: [UserService, OnlineService],
  exports: [UserService, OnlineService],
})
export class UserModule {}
