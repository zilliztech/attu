import { isString, IsString, MinLength } from 'class-validator';

export class CodeStringDto {
  @IsString({
    each: true
  })
  readonly code: string[];
}
