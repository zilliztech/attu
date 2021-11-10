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
} from "class-validator";
import {
  FieldType,
  ShowCollectionsType,
} from "@zilliz/milvus2-sdk-node/dist/milvus/types/Collection";
import { DataType } from "@zilliz/milvus2-sdk-node/dist/milvus/types/Common";
import { SearchParam } from "@zilliz/milvus2-sdk-node/dist/milvus/types";

enum VectorTypes {
  Binary = DataType.BinaryVector,
  Float = DataType.FloatVector,
}

export class CreateCollectionDto {
  @IsString()
  @IsNotEmpty({
    message: "collection_name is empty",
  })
  readonly collection_name: string;

  @IsBoolean()
  @IsOptional()
  readonly autoID: boolean;

  @IsArray()
  @ArrayNotEmpty()
  @IsNotEmpty({
    message: "fields is required",
  })
  readonly fields: FieldType[];
}

export class ShowCollectionsDto {
  @IsOptional()
  @IsEnum(ShowCollectionsType, { message: "Type allow all->0 inmemory->1" })
  readonly type: ShowCollectionsType;
}

export class InsertDataDto {
  @IsOptional()
  readonly partition_names?: string[];

  @IsNotEmpty({
    message: "fields_data is requried",
  })
  readonly fields_data: any[];
}

export class VectorSearchDto {
  @IsString()
  @IsNotEmpty({
    message: "collection_name is requried",
  })
  collection_name: string;

  @IsOptional()
  partition_names?: string[];

  @IsString()
  @IsOptional()
  expr?: string;

  @IsObject()
  @IsNotEmpty({
    message: "search_params is requried",
  })
  search_params: SearchParam;

  @IsArray()
  @ArrayMinSize(1)
  @IsNotEmpty({
    message: "vectors is requried",
  })
  vectors: number[][];

  @IsArray()
  @IsOptional()
  output_fields?: string[];

  @IsEnum(VectorTypes, { message: "Type allow all->0 inmemory->1" })
  @IsNotEmpty({
    message: "vector_type is requried",
  })
  vector_type: DataType.BinaryVector | DataType.FloatVector;
}

export class CreateAliasDto {
  @IsString()
  @IsNotEmpty({
    message: "alias is required",
  })
  alias: string;
}
