import { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import Icons from '@/components/icons/Icons';
import { AuthForm } from './AuthForm';
import CustomButton from '@/components/customButton/CustomButton';
import { MilvusService } from '@/http';
import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';

const ConnectContainer = () => {
  const [version, setVersion] = useState('loading');
  const { t: commonTrans } = useTranslation();
  const { t: btnTrans } = useTranslation('btn');

  useEffect(() => {
    MilvusService.getVersion().then((res: any) => {
      setVersion(res.attu);
    });
  }, []);

  return (
    <Box
      className="flex-center"
      sx={{
        width: '100%',
        height: '100vh',
        color: 'text.primary',
        backgroundColor: 'background.default',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          backgroundColor: 'background.default',
          border: (theme: Theme) => `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          minHeight: 680,
        }}
      >
        <Box
          className="flex-center"
          sx={{
            width: 320,
            display: 'flex',
            flexDirection: 'column',
            padding: (theme: Theme) => theme.spacing(4, 3),
            backgroundColor: (theme: Theme) => theme.palette.mode === 'dark' ? theme.palette.background.default : theme.palette.neutral[50],
            borderRadius: '12px 0 0 12px',
          }}
        >
          <Icons.attu
            sx={{
              width: 72,
              height: 'auto',
              marginBottom: (theme: Theme) => theme.spacing(2),
              display: 'block',
              color: 'primary.main',
            }}
          />
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: (theme: Theme) => theme.palette.mode === 'dark' ? theme.palette.common.white : 'primary.contrastText',
              marginTop: (theme: Theme) => theme.spacing(2),
              height: 32,
            }}
          >
            {commonTrans('attu.admin')}
          </Typography>
          {version && (
            <Typography
              component="sub"
              sx={{
                marginTop: (theme: Theme) => theme.spacing(1),
                fontSize: 13,
                color: (theme: Theme) => theme.palette.mode === 'dark' ? theme.palette.common.white : 'primary.contrastText',
                opacity: 0.8,
                height: 16,
              }}
            >
              {commonTrans('attu.version')}: {version}
            </Typography>
          )}

          <Box
            sx={{
              marginTop: (theme: Theme) => theme.spacing(6),
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              gap: (theme: Theme) => theme.spacing(2),
              '& button': {
                borderColor: (theme: Theme) => theme.palette.mode === 'dark' ? theme.palette.common.white : 'primary.contrastText',
                color: (theme: Theme) => theme.palette.mode === 'dark' ? theme.palette.common.white : 'primary.contrastText',
                height: 40,
                fontSize: 14,
                '&:hover': {
                  backgroundColor: 'primary.main',
                  borderColor: 'primary.main',
                },
              },
            }}
          >
            <CustomButton
              startIcon={<Icons.star />}
              fullWidth={true}
              variant="outlined"
              onClick={() =>
                window.open('https://github.com/zilliztech/attu', '_blank')
              }
            >
              {btnTrans('star')}
            </CustomButton>

            <CustomButton
              startIcon={<Icons.github />}
              fullWidth={true}
              variant="outlined"
              onClick={() =>
                window.open(
                  'https://github.com/zilliztech/attu/issues',
                  '_blank'
                )
              }
            >
              {commonTrans('attu.fileIssue')}
            </CustomButton>

            <CustomButton
              startIcon={<Icons.discord />}
              variant="outlined"
              onClick={() => window.open('https://milvus.io/discord', '_blank')}
              fullWidth={true}
            >
              {commonTrans('attu.discord')}
            </CustomButton>
          </Box>
        </Box>
        <Box
          sx={{
            width: 500,
            borderRadius: '0 8px 8px 0',
            padding: (theme: Theme) => theme.spacing(6, 0),
            backgroundColor: 'background.paper',
          }}
        >
          <AuthForm />
        </Box>
      </Box>
    </Box>
  );
};

export default ConnectContainer;
