import { IsNotEmpty, IsString, IsObject, IsOptional } from 'class-validator';

export class PlaygroundRequestDto {
  @IsNotEmpty({ message: 'method is required' })
  @IsString()
  readonly method: string;

  @IsNotEmpty({ message: 'url is required' })
  @IsString()
  readonly url: string;

  @IsOptional()
  @IsString()
  readonly host?: string;

  @IsOptional()
  @IsObject()
  readonly headers?: Record<string, string>;

  @IsOptional()
  @IsObject()
  readonly params?: Record<string, string>;

  @IsOptional()
  @IsObject()
  readonly body?: Record<string, any>;
}
