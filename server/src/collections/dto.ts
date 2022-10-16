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
} from '@zilliz/milvus2-sdk-node/dist/milvus/types/Collection';
import { DataType } from '@zilliz/milvus2-sdk-node/dist/milvus/types/Common';
import { SearchParam } from '@zilliz/milvus2-sdk-node/dist/milvus/types';

enum VectorTypes {
  Binary = DataType.BinaryVector,
  Float = DataType.FloatVector,
}

export class CreateCollectionDto {
  @IsString()
  readonly collection_name: string;

  @IsBoolean()
  @IsOptional()
  readonly autoID: boolean;

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

export class LoadSampleDto {
  readonly collection_name?: string;
  readonly size: string;
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

  @IsEnum(VectorTypes, { message: 'Type allow all->0 inmemory->1' })
  vector_type: DataType.BinaryVector | DataType.FloatVector;
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
