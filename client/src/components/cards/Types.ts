import { ReactElement } from 'react';

export interface EmptyCardProps {
  text: string;
  subText?: string;
  icon?: ReactElement;
  wrapperClass?: string;
  loading?: boolean;
}
