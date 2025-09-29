import { Transform } from 'class-transformer';

export class GetChatsDto {
  channel?: string;
  user?: string;

  @Transform(({ value }) => parseInt(value, 10))
  page?: number;

  @Transform(({ value }) => parseInt(value, 10))
  limit?: number = 50;

  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const [field, order] = value.split(':');
      return { [field]: order.toLowerCase() === 'desc' ? 'desc' : 'asc' };
    }
    return value;
  })
  sort?: { [key: string]: 'asc' | 'desc' } = {
    created_at: 'desc',
  };
}
