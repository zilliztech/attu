import { IsNotEmpty } from 'class-validator';

export class DatabaseNameDto {
  @IsNotEmpty({ message: 'db_name is empty' })
  readonly db_name: string;
}

export class DatabasePropertiesDto {
  @IsNotEmpty({ message: 'properties is empty' })
  readonly properties: Record<string, 'string | number | boolean'>;
}