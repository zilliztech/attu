import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';

export enum ManageType {
  DELETE = 'delete',
  CREATE = 'create',
}
export class GetPartitionsInfo {
  @ApiProperty({
    description: 'Milvus collection name',
  })
  @IsString()
  @IsNotEmpty({
    message: 'collection_name is empty',
  })
  readonly collection_name: string;
}

export class ManagePartition {
  @ApiProperty({
    description: 'Milvus collection name',
  })
  @IsString()
  @IsNotEmpty({
    message: 'collection_name is empty',
  })
  readonly collection_name: string;

  @ApiProperty({
    description: 'Milvus partition name',
  })
  @IsString()
  @IsNotEmpty({
    message: 'partition_name is empty',
  })
  readonly partition_name: string;

  @ApiProperty({ 
    description: 'Type allow delete and create',
    enum: ManageType
  })
  @IsEnum(ManageType, { message: 'Type allow delete and create' })
  readonly type: ManageType;
}

export class LoadPartitions {
  @ApiProperty({
    description: 'Milvus collection name',
  })
  @IsString()
  @IsNotEmpty({
    message: 'collection_name is empty',
  })
  readonly collection_name: string;

  @ApiProperty({
    description: 'Milvus partition name',
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsNotEmpty({
    message: 'partition_names is empty',
  })
  readonly partition_names: string[];
}
