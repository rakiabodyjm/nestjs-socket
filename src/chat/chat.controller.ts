import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ChatService } from 'src/chat/chat.service';
import { GetChatsDto } from 'src/chat/dto/get-chats.dto';
import { UserService } from 'src/user/user.service';

@Controller('chats')
export class ChatController {
  constructor(
    protected userService: UserService,
    protected chatService: ChatService,
  ) {}

  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  async findAll(@Query() query: GetChatsDto) {
    const chats = await this.chatService.findAll({
      where: {
        ...(query.channel && { channel: query.channel }),
        ...(query.user && { user: query.user }),
      },
      ...(query.sort && { orderBy: query.sort }),
      ...(query.page && query.limit
        ? { skip: (query.page - 1) * query.limit, take: query.limit }
        : { take: query.limit }),
    });

    const users = await this.userService.findAll({
      where: {
        id: {
          in: chats.map((chat) => chat.user),
        },
      },
    });

    return chats.map((chat) => ({
      ...chat,
      username:
        users.find((user) => user.id === chat.user)?.username || chat.id,
    }));
  }
}
