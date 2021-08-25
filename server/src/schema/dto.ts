import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsObject,
} from 'class-validator';

// todo import CreateIndexParam from sdk.
interface CreateIndexParam {
  index_type: string;
  metric_type: string;
  params: string;
}
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

  @ApiProperty({
    description: 'Milvus collection name',
  })
  @IsString()
  @IsNotEmpty({
    message: 'collection_name is empty',
  })
  readonly collection_name: string;

  @ApiProperty({
    description: 'field name',
  })
  @IsString()
  @IsNotEmpty({
    message: 'field_name is empty',
  })
  readonly field_name: string;

  @ApiProperty({
    type: [KeyValuePair],
  })
  @IsObject()
  @IsOptional()
  readonly extra_params?: CreateIndexParam;
}

export class DescribeIndex {
  @ApiProperty({
    description: 'Milvus collection description',
  })
  @IsString()
  @IsNotEmpty({
    message: 'collection_name is empty',
  })
  readonly collection_name: string;

  @ApiProperty({
    description: 'field name',
  })
  @IsString()
  @IsOptional()
  readonly field_name?: string;
}

export class GetIndexState {
  @ApiProperty({
    description: 'Milvus collection name',
  })
  @IsString()
  @IsNotEmpty({
    message: 'collection_name is empty',
  })
  readonly collection_name: string;

  @ApiProperty({
    description: 'field name',
  })
  @IsString()
  @IsOptional()
  readonly field_name?: string;
}

export class GetIndexProgress {
  @ApiProperty({
    description: 'Milvus collection name',
  })
  @IsString()
  @IsNotEmpty({
    message: 'collection_name is empty',
  })
  readonly collection_name: string;

  @ApiProperty({
    description: 'index name',
  })
  @IsString()
  // @IsNotEmpty({
  //   message: 'index_name is empty',
  // })
  readonly index_name: string;

  @ApiProperty({
    description: 'field name',
  })
  @IsString()
  @IsOptional()
  readonly field_name?: string;
}
