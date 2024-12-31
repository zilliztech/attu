import { IsArray, IsString } from 'class-validator';

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

  @IsString({ each: true })
  readonly roles: string;
}

export class UnassignUserRoleDto {
  @IsString()
  readonly username: string;

  @IsString()
  readonly roleName: string;
}

// privilege group
export class CreatePrivilegeGroupDto {
  @IsString()
  readonly name: string;

  @IsString()
  @IsArray()
  readonly privileges: string[];
}

// get privilege group
export class GetPrivilegeGroupDto {
  @IsString()
  readonly name: string;
}

export class UpdatePrivilegeGroupDto {
  @IsString()
  readonly name: string;

  @IsString()
  @IsArray()
  readonly privileges: string[];
}

export class DeletePrivilegeGroupDto {
  @IsString()
  readonly name: string;
}
