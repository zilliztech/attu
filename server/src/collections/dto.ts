import {
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsOptional,
  IsArray,
  ArrayNotEmpty,
  IsEnum,
  ArrayMinSize,
  IsObject,
} from 'class-validator';
import {
  FieldType,
  ShowCollectionsType,
  DataType,
  CreateIndexParam,
  SearchParam,
} from '@zilliz/milvus2-sdk-node';

enum VectorTypes {
  Binary = DataType.BinaryVector,
  Float = DataType.FloatVector,
  SparseFloatVector = DataType.SparseFloatVector,
  Float16Vector = DataType.Float16Vector,
  BFloat16Vector = DataType.BFloat16Vector,
}

export class CreateCollectionDto {
  @IsString()
  readonly collection_name: string;

  @IsBoolean()
  @IsOptional()
  readonly autoID: boolean;

  @IsBoolean()
  @IsOptional()
  readonly enableDynamicField: boolean;

  @IsArray()
  @ArrayNotEmpty()
  readonly fields: FieldType[];
}

export class ShowCollectionsDto {
  @IsOptional()
  @IsEnum(ShowCollectionsType, { message: 'Type allow all->0 inmemory->1' })
  readonly type: ShowCollectionsType;
}

export class InsertDataDto {
  @IsOptional()
  readonly partition_names?: string[];

  @IsArray()
  readonly fields_data: any[];
}

export class ImportSampleDto {
  @IsOptional()
  readonly collection_name: string;

  @IsString()
  readonly size: string;

  @IsBoolean()
  @IsOptional()
  readonly download?: boolean;

  @IsString()
  @IsOptional()
  readonly format?: string;

  @IsString()
  @IsOptional()
  readonly db_name?: string;
}

export class GetReplicasDto {
  @IsString()
  readonly collectionID: string;
  @IsOptional()
  readonly with_shard_nodes?: boolean;
}

export class VectorSearchDto {
  @IsOptional()
  partition_names?: string[];

  @IsString()
  @IsOptional()
  expr?: string;

  @IsObject()
  search_params: SearchParam;

  @IsArray()
  @ArrayMinSize(1)
  vectors: number[][];

  @IsArray()
  @IsOptional()
  output_fields?: string[];

  @IsEnum(VectorTypes, {
    message: ({ value }) => `Wrong vector type, ${value}`,
  })
  vector_type: VectorTypes;
}

export class CreateAliasDto {
  @IsString()
  alias: string;
}

export class QueryDto {
  @IsString()
  readonly expr: string;

  @IsArray()
  @IsOptional()
  readonly partitions_names: string[];

  @IsArray()
  @IsOptional()
  readonly output_fields: string[];
}

export class RenameCollectionDto {
  @IsString()
  @IsNotEmpty({ message: 'new_collection_name is empty.' })
  new_collection_name: string;
}

export class DuplicateCollectionDto {
  @IsString()
  @IsNotEmpty({ message: 'new_collection_name is empty.' })
  new_collection_name: string;
}

export enum ManageType {
  DELETE = 'delete',
  CREATE = 'create',
}

export class ManageIndexDto {
  @IsEnum(ManageType, { message: 'Type allow delete and create' })
  readonly type: ManageType;

  @IsString()
  readonly collection_name: string;

  @IsString()
  readonly field_name: string;

  @IsObject()
  @IsOptional()
  readonly extra_params?: CreateIndexParam;
}

export class DescribeIndexDto {
  @IsString()
  readonly collection_name: string;

  @IsString()
  @IsOptional()
  readonly field_name?: string;
}

export class GetIndexStateDto {
  @IsString()
  readonly collection_name: string;

  @IsString()
  @IsOptional()
  readonly field_name?: string;
}

export class GetIndexProgressDto {
  @IsString()
  readonly collection_name: string;

  @IsString()
  readonly index_name: string;

  @IsString()
  @IsOptional()
  readonly field_name?: string;
}
