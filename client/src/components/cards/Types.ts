import { ReactElement } from 'react';

interface CardProps {
  text: string;
  wrapperClass?: string;
}
export interface EmptyCardProps extends CardProps {
  icon: ReactElement;
}

export interface LoadingCardProps extends CardProps {}
