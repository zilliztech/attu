import { FC, useMemo } from 'react';
import StatusIcon from '@/components/status/StatusIcon';
import { useTranslation } from 'react-i18next';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { styled } from '@mui/system';
import { LOADING_STATE } from '@/consts';
import { LoadingType } from '@/components/status/StatusIcon';

export type StatusType = {
  status: LOADING_STATE;
  percentage?: number;
};

const Root = styled('div')({
  display: 'flex',
  alignItems: 'center',
});

const Label = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  textTransform: 'capitalize',
}));

const Circle = styled('div')(({ color }) => ({
  backgroundColor: color,
  borderRadius: '50%',
  width: '10px',
  height: '10px',
  marginRight: '4px', // Equivalent to theme.spacing(0.5)
}));

const LoadingIconWrapper = styled('div')({
  marginRight: '10px',
});

const Status: FC<StatusType> = props => {
  const { status, percentage = 0 } = props;
  const { t: commonTrans } = useTranslation();
  const theme = useTheme();

  const { label, color } = useMemo(() => {
    switch (status) {
      case LOADING_STATE.UNLOADED:
        return {
          label: commonTrans('status.unloaded'),
          color: theme.palette.primary.main,
        };

      case LOADING_STATE.LOADED:
        return {
          label: commonTrans('status.loaded'),
          color: '#06f3af',
        };

      case LOADING_STATE.LOADING:
        return {
          label: `${percentage}% ${commonTrans('status.loading')}`,
          color: '#f25c06',
        };

      default:
        return {
          label: commonTrans('status.error'),
          color: '#f25c06',
        };
    }
  }, [status, percentage, theme.palette.primary.main]);

  return (
    <Root>
      {status === LOADING_STATE.LOADED && <Circle color={color} />}
      {status === LOADING_STATE.LOADING && (
        <LoadingIconWrapper>
          <StatusIcon type={LoadingType.CREATING} />
        </LoadingIconWrapper>
      )}

      <Label variant="body2">{label}</Label>
    </Root>
  );
};

export default Status;
