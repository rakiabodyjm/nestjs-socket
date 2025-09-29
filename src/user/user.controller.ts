import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { genSaltSync, hashSync, compareSync } from 'bcrypt';
import { UseCustomSerialize } from 'src/response/custom-serialize.interceptor';
import { UserEntity } from 'src/user/entities/user.entity';
import { plainToInstance } from 'class-transformer';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard, User } from 'src/user/auth.guard';
import { OnlineService } from 'src/user/online.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly userService: UserService,
    private onlineService: OnlineService,
  ) {}

  @Get()
  findAll() {
    return this.userService
      .findAll()
      .then((res) => plainToInstance(UserEntity, res));
  }

  @Get('online')
  getOnlineUsers() {
    return this.onlineService.getOnlineUsers();
  }
}

@UseCustomSerialize(UserEntity)
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService,
  ) {}

  @Post('auth')
  async login(@Body() body: { username: string; password: string }) {
    const { username, password } = body;

    console.log({ username, password });
    // get password hash from db
    const user = await this.userService
      .findAll({
        where: {
          username,
        },
      })
      .then((users) => users[0]);

    if (!user) {
      throw new BadRequestException('Invalid username or password');
    }
    const passwordValid = compareSync(password, user.password);
    if (!passwordValid) {
      throw new BadRequestException('Invalid username or password');
    }
    return this.jwtService.sign({
      id: user.id,
      username: user.username,
    });
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  getProfile(@User() userId: string) {
    return this.userService.findOne(userId);
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const userExists = await this.userService
      .findAll({
        where: {
          username: createUserDto.username,
        },
      })
      .then((users) => users.length > 0);

    if (userExists) {
      throw new BadRequestException('Username already exists');
    }

    const passwordSalt = genSaltSync(10);
    const hashedPassword = hashSync(createUserDto.password, passwordSalt);
    createUserDto.password = hashedPassword;

    return this.userService.create(createUserDto).then(async (res) => {
      // await this.userService.remove(res.id);
      return res;
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService
      .findOne(id)
      .then((res) => plainToInstance(UserEntity, res));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    if ('password' in updateUserDto) {
      const passwordSalt = genSaltSync(10);
      const hashedPassword = hashSync(updateUserDto.password, passwordSalt);
      updateUserDto.password = hashedPassword;
    }

    return this.userService
      .update(id, updateUserDto)
      .then((res) => plainToInstance(UserEntity, res));
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.userService.findOne(id);
    return this.userService
      .remove(id)
      .then((res) => plainToInstance(UserEntity, res));
  }
}
