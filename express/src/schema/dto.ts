import { CreateIndexParam } from "@zilliz/milvus2-sdk-node/dist/milvus/types";
import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsObject,
} from "class-validator";

class KeyValuePair {
  key: string;
  value: string;
}

export enum ManageType {
  DELETE = "delete",
  CREATE = "create",
}

export class ManageIndexDto {
  @IsEnum(ManageType, { message: "Type allow delete and create" })
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
