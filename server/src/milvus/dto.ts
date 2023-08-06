import { ArrayMinSize, IsArray, IsString } from "class-validator";

export class ConnectMilvusDto {
  @IsString()
  readonly address: string;
}

export class CheckMilvusDto {
  @IsString()
  readonly address: string;
}

export class UseDatabaseDto {
  @IsString()
  readonly database: string;
}

export class FlushDto {
  @IsArray()
  @ArrayMinSize(1, { message: "At least need one collection name." })
  readonly collection_names: string[];
}
