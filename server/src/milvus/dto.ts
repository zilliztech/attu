import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsNotEmpty, IsString } from 'class-validator';

export class ConnectMilvus {
  @ApiProperty({
    description: 'Milvus url',
  })
  @IsString()
  @IsNotEmpty({
    message: 'address is empty',
  })
  readonly address: string;
}

export class CheckMilvus {
  @ApiProperty({
    description: 'Milvus url',
  })
  @IsString()
  @IsNotEmpty({
    message: 'address is empty',
  })
  readonly address: string;
}

export class Flush {
  @ApiProperty({
    description:
      'The collection names you want flush, flush will flush data into disk.',
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least need one collection name.' })
  readonly collection_names: string[];
}
