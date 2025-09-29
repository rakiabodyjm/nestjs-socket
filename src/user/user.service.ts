import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { ServiceError } from 'src/errors/service-error';

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

  create(createUserDto: CreateUserDto) {
    return this.prismaService.user.create({
      data: {
        password: createUserDto.password,
        username: createUserDto.username,
      },
    });
  }

  findAll(query: Prisma.UserFindManyArgs = {}) {
    return this.prismaService.user.findMany(query);
  }

  findOne(id: string) {
    return this.prismaService.user
      .findFirstOrThrow({
        where: { id },
      })
      .catch((err) => {
        if (err.code === 'P2025') {
          throw new ServiceError({
            code: 404,
            message: `User with ID ${id} not found.`,
          });
        }
        throw err;
      });
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return this.prismaService.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  remove(id: string) {
    return this.prismaService.user.delete({
      where: { id },
    });
  }
}
