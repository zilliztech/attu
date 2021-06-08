import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    const object = plainToClass(metatype, value);
    // when value is null, metatype exist, object will be null
    if (object === null) {
      throw new BadRequestException('params should not be empty');
    }

    // interface ValidatorOptions {
    //   skipMissingProperties?: boolean;
    //   whitelist?: boolean;
    //   forbidNonWhitelisted?: boolean;
    //   groups?: string[];
    //   dismissDefaultMessages?: boolean;
    //   validationError?: {
    //     target?: boolean;
    //     value?: boolean;
    //   };

    //   forbidUnknownValues?: boolean;
    // }
    const errors = await validate(object, {
      skipMissingProperties: false,
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    errors.forEach((error) => {
      let constraints = error.constraints;
      let currentError = error;
      while (!constraints && currentError) {
        constraints = currentError.constraints;
        currentError = currentError.children[0];
      }

      for (const i in constraints) {
        throw new BadRequestException(constraints[i]);
      }
    });
    return value;
  }

  private toValidate(metatype): boolean {
    const types = [String, Boolean, Number, Array, Object];
    return !types.find((type) => metatype === type);
  }
}
