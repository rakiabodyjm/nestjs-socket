import { IsNotEmpty, MaxLength } from 'class-validator';

export class CreateChatDto {
  @IsNotEmpty()
  user: string;

  @MaxLength(255)
  message: string;

  @MaxLength(100)
  channel: string = 'public';
}
