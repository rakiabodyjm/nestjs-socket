export class ChatEntity {
  id: string;
  user: string;
  message: string;
  channel: string;
  created_at: Date;
  updated_at: Date;
  username?: string;
}
