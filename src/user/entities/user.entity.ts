import { User } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class UserEntity implements User {
  created_at: Date;

  id: string;

  @Exclude()
  password: string;

  updated_at: Date;

  username: string;
}
