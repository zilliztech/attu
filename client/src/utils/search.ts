import { FieldOption } from '../types/SearchTypes';
import { FieldObject } from '@server/types';

export const getVectorFieldOptions = (fields: FieldObject[]): FieldOption[] => {
  const options: FieldOption[] = fields.map(f => {
    return {
      field: f,
      label: f.name,
      value: f.name,
    };
  });

  return options;
};
