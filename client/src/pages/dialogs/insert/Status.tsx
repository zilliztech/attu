import { FC } from 'react';
import { Theme, Typography, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { InsertStatusProps } from './Types';
import successPath from '@/assets/imgs/insert/success.png';
import failPath from '@/assets/imgs/insert/fail.png';
import { InsertStatusEnum } from './consts';

import Box from '@mui/material/Box';

const InsertStatus: FC<InsertStatusProps> = ({ status, failMsg }) => {
  const { t: insertTrans } = useTranslation('insert');

  const textSx = (theme: Theme) => ({ marginTop: theme.spacing(3) });
  const loadingTipSx = (theme: Theme) => ({ marginBottom: theme.spacing(6) });
  const loadingSvgSx = (theme: Theme) => ({
    color: theme.palette.primary.main,
  });
  const wrapperSx = (theme: Theme) => ({
    width: '75vw',
    height: status === InsertStatusEnum.loading ? '288px' : '200px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  });

  const InsertSuccess = () => (
    <>
      <img src={successPath} alt="insert success" />
      <Typography variant="h4" sx={textSx}>
        {insertTrans('statusSuccess')}
      </Typography>
    </>
  );

  const InsertLoading = () => (
    <>
      <CircularProgress size={64} thickness={5} sx={loadingSvgSx} />
      <Typography variant="h4" sx={textSx}>
        {insertTrans('statusLoading')}
      </Typography>
      <Typography
        variant="h5"
        sx={theme => ({ ...textSx(theme), ...loadingTipSx(theme) })}
      >
        {insertTrans('statusLoadingTip')}
      </Typography>
    </>
  );
  const InsertError = () => (
    <>
      <img src={failPath} alt="insert error" />
      <Typography variant="h4" sx={textSx}>
        {insertTrans('statusError')}
      </Typography>
      {failMsg && <Typography sx={textSx}>{failMsg}</Typography>}
    </>
  );

  const generateStatus = (status: InsertStatusEnum) => {
    switch (status) {
      case InsertStatusEnum.loading:
        return <InsertLoading />;
      case InsertStatusEnum.success:
        return <InsertSuccess />;
      // status error or init as default
      default:
        return <InsertError />;
    }
  };

  return (
    <Box component="section" sx={wrapperSx}>
      {generateStatus(status)}
    </Box>
  );
};

export default InsertStatus;
