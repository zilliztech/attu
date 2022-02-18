import { RequestHandler } from "express";
import { plainToClass } from "class-transformer";
import { validate, ValidationError } from "class-validator";
import { sanitize } from "class-sanitizer";
import HttpException from "../exception/HttpException";

/**
 * Only check for req.body
 * When use req.query or req.params cant use dto to validate.
 * Because all data are string in req.query.
 * @param type
 * @param skipMissingProperties
 * @returns
 */
export const dtoValidationMiddleware = (
  type: any,
  skipMissingProperties = false
): RequestHandler => {
  return (req, res, next) => {
    const dtoObj = plainToClass(type, req.body);
    validate(dtoObj, { skipMissingProperties }).then(
      (errors: ValidationError[]) => {
        if (errors.length > 0) {
          const dtoErrors = errors
            .map((error: ValidationError) =>
              (Object as any).values(error.constraints)
            )
            .join(", ");
          next(new HttpException(400, dtoErrors));
        } else {
          // sanitize the object and call the next middleware
          sanitize(dtoObj);
          req.body = dtoObj;
          next();
        }
      }
    );
  };
};
