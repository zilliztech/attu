import { FC } from 'react';
import { Theme, Typography, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { InsertStatusProps } from './Types';
import successPath from '@/assets/imgs/insert/success.png';
import failPath from '@/assets/imgs/insert/fail.png';
import { InsertStatusEnum } from './consts';
import Box from '@mui/material/Box';

const InsertStatus: FC<InsertStatusProps> = ({ status, failMsg, importingCount }) => {
  const { t: insertTrans } = useTranslation('insert');

  const iconSx = {
    width: '64px',
    height: '64px',
    marginBottom: 2,
  };

  const textSx = (theme: Theme) => ({
    marginTop: theme.spacing(2),
    textAlign: 'center',
  });

  const errorTextSx = (theme: Theme) => ({
    ...textSx(theme),
    color: theme.palette.error.main,
  });

  const wrapperSx = (theme: Theme) => ({
    width: '40vw',
    minHeight: '200px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(4),
  });

  const InsertSuccess = () => (
    <>
      <img src={successPath} alt="insert success" style={iconSx} />
      <Typography variant="h5" sx={textSx}>
        {insertTrans('statusSuccess')}
      </Typography>
    </>
  );

  const InsertLoading = () => (
    <>
      <CircularProgress size={64} thickness={4} sx={{ marginBottom: 2 }} />
      <Typography variant="h5" sx={textSx}>
        {insertTrans('importingRecords', { count: importingCount })}
      </Typography>
    </>
  );

  const InsertError = () => (
    <>
      <img src={failPath} alt="insert error" style={iconSx} />
      <Typography variant="h5" sx={errorTextSx}>
        {insertTrans('statusError')}
      </Typography>
      {failMsg && (
        <Typography variant="body1" sx={errorTextSx}>
          {failMsg}
        </Typography>
      )}
    </>
  );

  const generateStatus = (status: InsertStatusEnum) => {
    switch (status) {
      case InsertStatusEnum.loading:
        return <InsertLoading />;
      case InsertStatusEnum.success:
        return <InsertSuccess />;
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
