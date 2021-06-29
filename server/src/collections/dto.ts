import {
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsOptional,
  IsArray,
  ArrayNotEmpty,
  IsEnum,
} from 'class-validator';
import {
  FieldType,
  ShowCollectionsType,
} from '@zilliz/milvus2-sdk-node/dist/milvus/types/Collection'; // todo: need improve like export types in root file.
import { ApiProperty } from '@nestjs/swagger';

export class CreateCollection {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({
    message: 'collection_name is empty',
  })
  readonly collection_name: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  readonly autoID: boolean;

  @ApiProperty()
  @IsArray()
  @ArrayNotEmpty()
  @IsNotEmpty({
    message: 'fields is empty',
  })
  readonly fields: FieldType[];
}

export class ShowCollections {
  @ApiProperty({ enum: ShowCollectionsType })
  @IsOptional()
  @IsEnum(ShowCollectionsType, { message: 'Type allow all->0 inmemory->1' })
  readonly type: ShowCollectionsType;
}
