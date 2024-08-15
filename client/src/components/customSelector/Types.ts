import { FormControlClassKey, SelectProps } from '@mui/material';
import { ClassNameMap } from '@mui/styles';

export interface Option<T = string, U = string | number> {
  label: T;
  value: U;
}

export interface GroupOption {
  label: string;
  children: Option[];
}

export type CustomSelectorType = SelectProps & {
  label?: string;
  value: string | number;
  options: Option[];
  classes?: Partial<ClassNameMap<FormControlClassKey>>;
  variant?: 'filled' | 'outlined' | 'standard';
  labelClass?: string;
  wrapperClass?: string;
  hiddenlabel?: string;
  size?: 'small' | 'medium' | undefined;
};

export type CustomMultiSelectorType = Omit<CustomSelectorType, 'value'> & {
  values: string[];
  renderValue?: (selected: string[]) => React.ReactNode;
};

export interface ICustomGroupSelect {
  className?: string;
  options: GroupOption[];
  haveLabel?: boolean;
  label?: string;
  placeholder?: string;
  value: any;
  onChange: (event: any) => void;
}
