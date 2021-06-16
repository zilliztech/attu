import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsArray,
  IsEnum,
  IsOptional,
} from 'class-validator';

class KeyValuePair {
  @ApiProperty()
  key: string;
  @ApiProperty()
  value: string;
}

export enum ManageType {
  DELETE = 'delete',
  CREATE = 'create',
}

export class ManageIndex {
  @ApiProperty({ enum: ManageType })
  @IsEnum(ManageType, { message: 'Type allow delete and create' })
  readonly type: ManageType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({
    message: 'collection_name is empty',
  })
  readonly collection_name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({
    message: 'field_name is empty',
  })
  readonly field_name: string;

  @ApiProperty({
    type: [KeyValuePair],
  })
  @IsArray()
  @IsOptional()
  readonly extra_params?: KeyValuePair[];
}

export class DescribeIndex {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({
    message: 'collection_name is empty',
  })
  readonly collection_name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  readonly field_name?: string;
}

export class GetIndexState {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({
    message: 'collection_name is empty',
  })
  readonly collection_name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  readonly field_name?: string;
}

export class GetIndexProgress {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({
    message: 'collection_name is empty',
  })
  readonly collection_name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({
    message: 'index_name is empty',
  })
  readonly index_name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  readonly field_name?: string;
}
