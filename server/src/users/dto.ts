import { IsString, IsOptional,MinLength,MaxLength,Matches } from 'class-validator';

export class CreateUserDto {
  @Matches(/^[a-zA-Z][a-zA-Z0-9_-]*$/, {
    message: 'Username must start with a letter and can only contain letters, numbers, underscores, and hyphens'
  })
  @IsString({ message: 'username is required.' })
  readonly username: string;
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(72, { message: 'Password must not exceed 72 characters' })
  @IsString({ message: 'password is required.' })
  readonly password: string;
}

export class CreateRoleDto {
  @IsString({ message: 'roleName is required.' })
  readonly roleName: string;
}

export class UpdateUserDto {
  @IsString({ message: 'username is required.' })
  readonly username: string;

  @IsString({ message: 'oldPassword is required.' })
  readonly oldPassword: string;

  @IsString({ message: 'newPassword is required.' })
  readonly newPassword: string;
}

export class AssignUserRoleDto {
  @IsString({ each: true, message: 'roles is required.' })
  readonly roles: string;
}

export class UnassignUserRoleDto {
  @IsString({ message: 'roles is required.' })
  readonly roleName: string;
}

// privilege group
export class CreatePrivilegeGroupDto {
  @IsString({ message: 'group_name is required.' })
  readonly group_name: string;

  @IsString({ message: 'privileges[] is required.', each: true })
  readonly privileges: string[];
}

// get privilege group
export class GetPrivilegeGroupDto {
  @IsString({ message: 'group_name is required.' })
  readonly group_name: string;
}

export class UpdatePrivilegeGroupDto {
  @IsString({ message: 'privileges[] is required.', each: true })
  readonly privileges: string[];
}

// grant/revoke privilege to role
export class PrivilegeToRoleDto {
  @IsString({ message: 'roleName is empty.' })
  readonly role: string;

  @IsString()
  @IsOptional()
  readonly collection: string;

  @IsString({ message: 'privilege is empty.' })
  readonly privilege: string;
}
