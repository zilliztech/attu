import { FormControlClassKey, SelectProps } from '@material-ui/core';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';

export interface Option {
  label: string;
  value: string | number;
}

export interface GroupOption {
  label: string;
  children: Option[];
}

export type CustomSelectorType = SelectProps & {
  label: string;
  value: string | number;
  options: Option[];
  onChange: (e: React.ChangeEvent<{ value: unknown }>) => void;
  classes?: Partial<ClassNameMap<FormControlClassKey>>;
  variant?: 'filled' | 'outlined' | 'standard';
};

export interface ICustomGroupSelect {
  className?: string;
  options: GroupOption[];
  haveLabel?: boolean;
  label?: string;
  placeholder?: string;
  value: string | number;
  onChange: (event: any) => void;
}
