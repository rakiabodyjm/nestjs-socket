import { Injectable } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { ChatEntity } from './entities/chat.entity';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}
  async create(createChatDto: CreateChatDto): Promise<ChatEntity> {
    return this.prisma.chat.create({
      data: {
        user: createChatDto.user,
        message: createChatDto.message,
        channel: createChatDto.channel,
      },
    });
  }

  async findAll(params?: Prisma.ChatFindManyArgs): Promise<ChatEntity[]> {
    return this.prisma.chat.findMany({
      orderBy: {
        created_at: 'desc',
      },
      ...params,
    });
  }

  async findOne(id: string): Promise<ChatEntity | null> {
    return this.prisma.chat.findUnique({
      where: { id },
    });
  }

  async update(id: string, updateChatDto: UpdateChatDto): Promise<ChatEntity> {
    return this.prisma.chat.update({
      where: { id },
      data: {
        ...(updateChatDto.message && { message: updateChatDto.message }),
        ...(updateChatDto.channel && { channel: updateChatDto.channel }),
      },
    });
  }

  async remove(id: string): Promise<ChatEntity> {
    return this.prisma.chat.delete({
      where: { id },
    });
  }

  async findByChannel(channel: string): Promise<ChatEntity[]> {
    return this.prisma.chat.findMany({
      where: { channel },
      orderBy: {
        created_at: 'desc',
      },
    });
  }
}
