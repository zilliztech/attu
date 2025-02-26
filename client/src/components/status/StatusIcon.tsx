import CircularProgress from '@mui/material/CircularProgress';
import { FC, ReactElement } from 'react';
import { styled } from '@mui/system';

export enum LoadingType {
  CREATING = 'creating',
  FINISH = 'finish',
  ERROR = 'error',
}

export type StatusIconType = {
  type: LoadingType;
  className?: string;
  size?: number;
};

const Wrapper = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
  paddingLeft: theme.spacing(0.5),
}));

const StyledCircularProgress = styled(CircularProgress)(({ theme }) => ({
  color: theme.palette.primary.main,
}));

const StatusIcon: FC<StatusIconType> = props => {
  const { type, className = '', size = 16 } = props;

  const getElement = (type: LoadingType): ReactElement => {
    switch (type) {
      case 'creating':
        return <StyledCircularProgress size={size} thickness={4} />;
      case 'finish':
        return <></>;
      default:
        return <></>;
    }
  };

  return <Wrapper className={className}>{getElement(type)}</Wrapper>;
};

export default StatusIcon;
