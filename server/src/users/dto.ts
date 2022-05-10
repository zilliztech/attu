import { IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  readonly username: string;

  @IsString()
  readonly password: string;
}

export class UpdateUserDto {
  @IsString()
  readonly username: string;

  @IsString()
  readonly oldPassword: string;

  @IsString()
  readonly newPassword: string;
}
