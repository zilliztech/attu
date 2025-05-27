import { IValidationItem } from '@/hooks';

export interface LabelValuePair {
  label: string;
  value: string | number;
}

export type FormHelperType = {
  formValue: { [x: string]: any };
  updateForm: (type: string, value: string | number | boolean) => void;
  validation: { [key: string]: IValidationItem };
  checkIsValid: Function;
  wrapperClass?: string;
};
