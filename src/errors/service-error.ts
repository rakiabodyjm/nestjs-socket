export class ServiceError extends Error {
  code: number = 500;
  constructor({ message, code }: { message: string; code: number }) {
    super(message);
    this.code = code;
  }
}
