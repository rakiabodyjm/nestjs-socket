import {
  IsNotEmpty,
  MinLength,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function IsEqualTo(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: unknown, propertyName: string) {
    registerDecorator({
      name: 'isEqualTo',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [propertyName] = args.constraints;

          return args.object[propertyName] === value;
        },
      },
    });
  };
}

export class CreateUserDto {
  @IsNotEmpty()
  @MinLength(4)
  username: string;

  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsEqualTo('password', { message: 'Passwords do not match' })
  @IsNotEmpty()
  @MinLength(8)
  confirm_password?: string;
}
