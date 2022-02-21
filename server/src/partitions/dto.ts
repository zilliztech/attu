import { IsString, IsEnum, IsArray, ArrayNotEmpty } from "class-validator";

export enum ManageType {
  DELETE = "delete",
  CREATE = "create",
}
export class GetPartitionsInfoDto {
  @IsString()
  readonly collection_name: string;
}

export class ManagePartitionDto {
  @IsString()
  readonly collection_name: string;

  @IsString()
  readonly partition_name: string;

  @IsEnum(ManageType, { message: "Type allow delete and create" })
  readonly type: ManageType;
}

export class LoadPartitionsDto {
  @IsString()
  readonly collection_name: string;

  @IsArray()
  @ArrayNotEmpty()
  readonly partition_names: string[];
}
