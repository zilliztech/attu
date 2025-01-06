import { IsArray, IsString, IsOptional } from 'class-validator';

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
  @IsString({ message: 'name is required.' })
  readonly name: string;
}

export class UpdatePrivilegeGroupDto {
  @IsString({ message: 'privileges[] is required.' })
  @IsArray()
  readonly privileges: string[];
}

// grant/revoke privilege to role
export class PrivilegeToRoleDto {
  @IsString({ message: 'roleName is empty.' })
  readonly role: string;

  @IsString()
  @IsOptional()
  readonly collection: string;

  @IsString()
  readonly privilege: string;
}
