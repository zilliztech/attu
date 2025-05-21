import { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import Icons from '@/components/icons/Icons';
import { AuthForm } from './AuthForm';
import CustomButton from '@/components/customButton/CustomButton';
import { MilvusService } from '@/http';
import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';

// used for user connect process
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
          boxShadow: '0px 6px 30px rgba(0, 0, 0, 0.1)',
          minHeight: 644,
        }}
      >
        <Box
          className="flex-center"
          sx={{
            width: 299,
            display: 'flex',
            flexDirection: 'column',
            padding: (theme: Theme) => theme.spacing(0, 3),
            backgroundColor: 'background.default',
            borderRadius: 2,
          }}
        >
          <Icons.attu
            sx={{
              width: 64,
              height: 'auto',
              marginBottom: (theme: Theme) => theme.spacing(1),
              display: 'block',
              color: 'primary.main',
            }}
          />
          <Typography
            variant="body2"
            sx={{
              fontSize: 24,
              fontWeight: 'bold',
              color: 'text.primary',
              marginTop: (theme: Theme) => theme.spacing(2),
              height: 24,
            }}
          >
            {commonTrans('attu.admin')}
          </Typography>
          {version && (
            <Typography
              component="sub"
              sx={{
                marginTop: (theme: Theme) => theme.spacing(1),
                fontSize: 12,
                color: 'text.secondary',
                height: 12,
              }}
            >
              {commonTrans('attu.version')}: {version}
            </Typography>
          )}

          <Box
            sx={{
              marginTop: (theme: Theme) => theme.spacing(4),
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              padding: (theme: Theme) => theme.spacing(2, 0),
              '& button': {
                borderColor: 'transparent',
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
            width: 481,
            borderRadius: 2,
            padding: (theme: Theme) => theme.spacing(5, 0),
            boxShadow: '0px 6px 30px rgba(0, 0, 0, 0.1)',
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
