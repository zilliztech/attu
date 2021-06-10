import { IsNotEmpty, IsString } from 'class-validator';

export class ConnectMilvus {
  @IsString()
  @IsNotEmpty({
    message: 'address is empty',
  })
  readonly address: string;
}

export class CheckMilvus {
  @IsString()
  @IsNotEmpty({
    message: 'address is empty',
  })
  readonly address: string;
}
