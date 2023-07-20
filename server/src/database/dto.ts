import { IsString } from 'class-validator';

export class CreateDatabaseDto {
  @IsString()
  readonly db_name: string;
}

export class DropDatabaseDto {
  @IsString()
  readonly db_name: string;
}
