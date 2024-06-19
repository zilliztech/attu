import { IValidationItem } from '@/hooks';

export interface LabelValuePair {
  label: string;
  value: string | number;
}

export enum ManageRequestMethods {
  DELETE = 'delete',
  CREATE = 'create',
}

export type FormHelperType = {
  formValue: { [x: string]: any };
  updateForm: (type: string, value: string) => void;
  validation: { [key: string]: IValidationItem };
  checkIsValid: Function;
  wrapperClass?: string;
};
