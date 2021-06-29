import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ConnectMilvus {
  @ApiProperty({
    description: 'Milvus url'
  })
  @IsString()
  @IsNotEmpty({
    message: 'address is empty',
  })
  readonly address: string;
}

export class CheckMilvus {
  @ApiProperty({
    description: 'Milvus url'
  })
  @IsString()
  @IsNotEmpty({
    message: 'address is empty',
  })
  readonly address: string;
}
