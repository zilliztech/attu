import { useEffect, useState } from 'react';
import { Theme, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import Icons from '@/components/icons/Icons';
import { AuthForm } from './AuthForm';
import CustomButton from '@/components/customButton/CustomButton';
import { MilvusService } from '@/http';
import { makeStyles } from '@mui/styles';

const getContainerStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    width: '100%',
    height: '100vh',
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.default,
  },
  box: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: theme.palette.background.default,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 8,
    boxShadow: '0px 6px 30px rgba(0, 0, 0, 0.1)',
    minHeight: 644,
  },
  logo: {
    width: 64,
    height: 'auto',
    marginBottom: theme.spacing(1),
    display: 'block',
    color: theme.palette.primary.main,
  },
  links: {
    marginTop: theme.spacing(4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: theme.spacing(2, 0),
    '& button': {
      borderColor: 'transparent',
    },
  },
  attu: {
    width: 299,
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(0, 3),
    backgroundColor: theme.palette.background.default,
    borderRadius: 8,
  },
  form: {
    width: 481,
    borderRadius: 8,
    padding: theme.spacing(5, 0),
    boxShadow: '0px 6px 30px rgba(0, 0, 0, 0.1)',
    backgroundColor: theme.palette.background.paper,
  },
  brand: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.palette.text.primary,
    marginTop: theme.spacing(2),
    height: 24,
  },
  sub: {
    marginTop: theme.spacing(1),
    fontSize: 12,
    color: theme.palette.text.secondary,
    height: 12,
  },
}));

// used for user connect process
const ConnectContainer = () => {
  const [version, setVersion] = useState('loading');
  const classes = getContainerStyles();
  const { t: commonTrans } = useTranslation();
  const attuTrans = commonTrans('attu');
  const { t: btnTrans } = useTranslation('btn');

  useEffect(() => {
    MilvusService.getVersion().then((res: any) => {
      setVersion(res.attu);
    });
  }, []);

  return (
    <main className={`flex-center ${classes.wrapper}`}>
      <section className={classes.box}>
        <section className={`flex-center ${classes.attu}`}>
          <Icons.attu classes={{ root: classes.logo }} />
          <Typography variant="body2" className={classes.brand}>
            {attuTrans.admin}
          </Typography>
          {version && (
            <Typography component="sub" className={classes.sub}>
              {attuTrans.version} {version}
            </Typography>
          )}

          <div className={classes.links}>
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
              {attuTrans.fileIssue}
            </CustomButton>

            <CustomButton
              startIcon={<Icons.discord />}
              variant="outlined"
              onClick={() => window.open('https://milvus.io/discord', '_blank')}
              fullWidth={true}
            >
              {attuTrans.discord}
            </CustomButton>
          </div>
        </section>
        <section className={classes.form}>
          <AuthForm />
        </section>
      </section>
    </main>
  );
};

export default ConnectContainer;
