import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller';
import { UserModule } from 'src/user/user.module';

@Module({
  providers: [ChatGateway, ChatService],
  controllers: [ChatController],
  imports: [UserModule],
})
export class ChatModule {}
