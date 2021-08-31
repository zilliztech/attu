import { ReactElement } from 'react';

export interface EmptyCardProps {
  text: string;
  icon?: ReactElement;
  wrapperClass?: string;
  loading?: boolean;
}
