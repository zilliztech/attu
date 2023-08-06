import { ReactElement } from 'react';
import { InputLabelProps } from '@material-ui/core';
import { IValidationItem } from '@/hooks';
import { IExtraParam, ValidType } from '@/utils/Validation';

export type InputType = 'icon' | 'adornment' | 'text' | undefined;
export type VariantType = 'filled' | 'outlined' | 'standard';
export type SizeType = 'small' | 'medium' | undefined;

export type AlignItemsType =
  | 'baseline'
  | 'center'
  | 'stretch'
  | 'flex-start'
  | 'flex-end'
  | undefined;

export interface IValidation {
  rule: ValidType;
  // extra params for some special check like confirm
  extraParam?: IExtraParam;
  errorText: string;
}

export interface IBlurParam {
  event: any;
  key: string;
  param: {
    cb: Function;
    checkValid: Function;
    validations: IValidation[];
  };
}

export interface IChangeParam extends IBlurParam {}

export interface ICustomInputProps {
  type?: InputType;
  iconConfig?: IIconConfig;
  adornmentConfig?: IAdornmentConfig;
  textConfig?: ITextfieldConfig;

  // used for validation
  checkValid?: Function;
  validInfo?: IValidInfo;
}

export interface IValidInfo {
  [key: string]: IValidationItem;
}

export interface IIconConfig {
  icon: ReactElement;
  inputType: InputType;
  inputConfig: ITextfieldConfig | IAdornmentConfig;
  containerClass?: string;
  spacing?: any;
  alignItems?: AlignItemsType;
  iconClass?: string;
}

export interface ITextfieldConfig {
  variant: VariantType;
  value?: any;
  label?: string;
  hiddenLabel?: boolean;
  size?: SizeType;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  defaultValue?: any;
  classes?: any;
  InputProps?: any;
  inputProps?: any;
  key: string;
  validations?: IValidation[];
  fullWidth?: boolean;
  className?: string;
  type?: string;
  onBlur?: (event: any) => void;
  onChange?: (event: any) => void;
  InputLabelProps?: Partial<InputLabelProps>;
}

export interface IAdornmentConfig {
  label: string;
  key: string;
  icon?: ReactElement;
  isPasswordType?: boolean;
  inputClass?: string;
  showPassword?: boolean;
  validations?: IValidation[];
  onIconClick?: () => void;
  onInputBlur?: (event: any) => void;
  onInputChange?: (event: any) => void;
}

export type SearchType = {
  searchText?: string;
  placeholder?: string;
  onClear?: () => void;
  onSearch: (value: string) => void;
};
