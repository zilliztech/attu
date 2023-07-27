import { IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  readonly username: string;

  @IsString()
  readonly password: string;
}

export class CreateRoleDto {
  @IsString()
  readonly roleName: string;
}

export class UpdateUserDto {
  @IsString()
  readonly username: string;

  @IsString()
  readonly oldPassword: string;

  @IsString()
  readonly newPassword: string;
}

export class AssignUserRoleDto {
  @IsString()
  readonly username: string;

  @IsString()
  readonly roleName: string;
}

export class UnassignUserRoleDto {
  @IsString()
  readonly username: string;

  @IsString()
  readonly roleName: string;
}
