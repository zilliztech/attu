import {
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsString,
  IsNotEmpty,
  IsBoolean,
} from 'class-validator';

export class ConnectMilvusDto {
  @IsString({ message: 'address must be a string.' })
  @IsNotEmpty({ message: 'address is required.' })
  readonly address: string;

  @IsString({ message: 'database must be a string.' })
  @IsOptional()
  readonly database: string;

  @IsString({ message: 'username must be a string.' })
  readonly username: string;

  @IsString({ message: 'password must be a string.' })
  readonly password: string;

  @IsString({ message: 'token must be a string.' })
  @IsOptional()
  readonly token: string;

  @IsBoolean({ message: 'ssl must be a boolean.' })
  @IsOptional()
  readonly ssl: boolean;

  @IsBoolean({ message: 'checkHealth must be a boolean.' })
  @IsOptional()
  readonly checkHealth: boolean;

  @IsOptional({ message: 'clientId is optional.' })
  readonly clientId: string;
}

export class UseDatabaseDto {
  @IsString({ message: 'database name must be a string.' })
  @IsNotEmpty({ message: 'database name is required.' })
  readonly database: string;
}

export class FlushDto {
  @IsArray({ message: 'collection_names must be an array of strings.' })
  @ArrayMinSize(1, {
    message: 'collection_names must contains at least 1 item.',
  })
  readonly collection_names: string[];
}
