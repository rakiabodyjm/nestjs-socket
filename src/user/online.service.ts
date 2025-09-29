import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { UserEntity } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class OnlineService {
  private onlineUsers: Map<string, User & { socketId: string }> = new Map();

  constructor(private readonly userService: UserService) {}

  async addUser(userId: string, socketId: string) {
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const duplicateId = Array.from(this.onlineUsers.values()).find(
      (socketUser) => socketUser.id === user.id,
    );

    if (duplicateId) {
      this.onlineUsers.delete(duplicateId.socketId);
    }

    this.onlineUsers.set(socketId, {
      ...user,
      socketId,
    });

    return plainToInstance(UserEntity, user);
  }

  async removeUser(socketId: string) {
    const user = this.onlineUsers.get(socketId);

    if (user) {
      this.onlineUsers.delete(socketId);
      return user;
    }
  }

  getOnlineUsers(): (User & { socketId: string })[] {
    return Array.from(this.onlineUsers.values());
  }
}
