import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  WsException,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { UserService } from 'src/user/user.service';
import { OnlineService } from 'src/user/online.service';
import { User } from '@prisma/client';

@WebSocketGateway({
  cors: {
    origin: '*',
    allowedHeaders: ['Content-Type'],
  },
  transports: ['websocket'],
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly chatService: ChatService,
    private readonly userService: UserService,
    private readonly onlineService: OnlineService,
  ) {}

  @SubscribeMessage('isTyping')
  handleIsTyping(@MessageBody() data: any, @ConnectedSocket() socket: Socket) {
    socket.broadcast.emit('isTyping', {
      ...data,
    });
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    this.onlineService.removeUser(client.id).then(async (userRemoved) => {
      if (userRemoved) {
        const onlineUsers = this.onlineService.getOnlineUsers();

        const users = await this.userService.findAll({
          where: {
            id: {
              in: onlineUsers.map((user) => user.id),
            },
          },
        });

        // TODO fix this
        // client.broadcast.emit('offline', {
        //   ...userRemoved,
        //   username: userAddedUsername,
        // });
        client.broadcast.emit('offline', [
          ...onlineUsers.map((user) => ({
            ...user,
            username: users.find((u) => u.id === user.id)?.username || user.id,
          })),
        ]);
      }
    });
  }

  @SubscribeMessage('online')
  async setOnline(
    @MessageBody() message: User,
    @ConnectedSocket() socket: Socket,
  ) {
    this.onlineService.addUser(message.id, socket.id);

    const onlineUsers = this.onlineService.getOnlineUsers();

    const users = await this.userService.findAll({
      where: {
        id: {
          in: onlineUsers.map((user) => user.id),
        },
      },
    });

    socket.broadcast.emit('online', [
      ...onlineUsers.map((user) => ({
        ...user,
        username: users.find((u) => u.id === user.id)?.username || user.id,
      })),
    ]);
  }

  // @SubscribeMessage('offline')
  // async setOffline(
  //   @MessageBody() message: User,
  //   @ConnectedSocket() socket: Socket,
  // ) {
  //   console.log('removing user', socket.id);
  //   const userRemoved = await this.onlineService.removeUser(socket.id);
  //   console.log('User offline:', userRemoved, socket.id);
  //   console.log({
  //     userRemoved,
  //   });
  //   socket.broadcast.emit('offline', userRemoved);
  // }

  @SubscribeMessage('createChat')
  async create(
    @MessageBody() createChatDto: CreateChatDto,
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      console.log('received', createChatDto, 'socket id:', socket.id);
      return await this.chatService.create(createChatDto).then(async (res) => {
        // inject username
        const user = await this.userService.findOne(res.user);

        const data = {
          ...res,
          username: user ? user.username : user.id,
        };
        socket.broadcast.emit('chatCreated', data);
        socket.emit('chatCreated', data);
        return data;
      });
    } catch (error) {
      console.error('Error creating chat:', error);
      throw new WsException('Failed to create chat message');
    }
  }

  @SubscribeMessage('findAllChat')
  findAll() {
    return this.chatService.findAll().then(async (chats) => {
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
    });
  }

  @SubscribeMessage('findOneChat')
  findOne(@MessageBody() id: string) {
    return this.chatService.findOne(id);
  }

  @SubscribeMessage('updateChat')
  update(@MessageBody() updateChatDto: UpdateChatDto) {
    return this.chatService.update(updateChatDto.id, updateChatDto);
  }

  @SubscribeMessage('removeChat')
  remove(@MessageBody() id: string) {
    return this.chatService.remove(id);
  }
}
