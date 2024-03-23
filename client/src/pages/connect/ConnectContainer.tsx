import { useEffect, useState } from 'react';
import { makeStyles, Theme, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import Icons from '@/components/icons/Icons';
import { AuthForm } from './AuthForm';
import CustomButton from '@/components/customButton/CustomButton';
import { MilvusService } from '@/http';

const getContainerStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    width: '100%',
    height: '100vh',
  },
  box: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: '#fff',
    border: '1px solid #E0E0E0',
    boxShadow: '0px 6px 30px rgba(0, 0, 0, 0.1)',
  },
  logo: {
    width: 64,
    height: 'auto',
    marginBottom: theme.spacing(1),
    display: 'block',
    marginTop: 140,
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
      border: 'none',
    },
  },

  attu: {
    width: 299,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: theme.spacing(0, 3),
    position: 'relative',
    backgroundColor: '#f5f5f5',
  },
  form: {
    width: 481,
    padding: theme.spacing(5, 0),
  },
  sub: {
    marginTop: theme.spacing(1),
    fontSize: 12,
    color: '#666',
  },
}));

// used for user connect process
const ConnectContainer = () => {
  const [version, setVersion] = useState('');
  const classes = getContainerStyles();
  const { t: commonTrans } = useTranslation();
  const attuTrans = commonTrans('attu');

  useEffect(() => {
    MilvusService.getVersion().then((res: any) => {
      setVersion(res.attu);
    });
  }, []);

  return (
    <main className={`flex-center ${classes.wrapper}`}>
      <section className={classes.box}>
        <section className={classes.attu}>
          <Icons.attu classes={{ root: classes.logo }} />
          <Typography variant="h2" className="title">
            {attuTrans.admin}
          </Typography>
          {version && (
            <Typography component="sub" className={classes.sub}>
              {attuTrans.version} {version}
            </Typography>
          )}

          <div className={classes.links}>
            <CustomButton
              startIcon={<Icons.github />}
              fullWidth={true}
              variant="outlined"
              onClick={() =>
                window.open('https://github.com/zilliztech/attu', '_blank')
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
