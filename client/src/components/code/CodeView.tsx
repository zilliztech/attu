import { makeStyles, Theme, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import CustomTabList from '../customTabList/CustomTabList';
import CodeBlock from './CodeBlock';

const getStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    boxSizing: 'border-box',
    width: 480,

    padding: theme.spacing(4),
    backgroundColor: theme.palette.milvusDark.main,
    borderRadius: 8,

    color: '#fff',
  },
  title: {
    marginBottom: theme.spacing(2),
  },

  // override tab list style
  tabs: {
    minHeight: 0,

    '& .MuiTab-wrapper': {
      textTransform: 'uppercase',
      fontWeight: 'bold',
      color: '#fff',
    },

    '& .MuiTab-root': {
      minHeight: 18,
      marginRight: 0,
    },

    // disable Ripple Effect
    '& .MuiTouchRipple-root': {
      display: 'none',
    },

    '& .Mui-selected': {
      '& .MuiTab-wrapper': {
        color: theme.palette.primary.main,
      },
    },

    '& .MuiTabs-indicator': {
      display: 'flex',
      justifyContent: 'center',

      top: 32,
      backgroundColor: 'transparent',

      '& > div': {
        height: 1,
        width: '100%',
        maxWidth: 26,
        backgroundColor: theme.palette.primary.main,
      },
    },

    '& .MuiTabs-flexContainer': {
      borderBottom: 'none',
    },
  },
}));

const CodeView = () => {
  const classes = getStyles();
  const { t: commonTrans } = useTranslation();

  const mockTabs = [
    {
      label: 'node.js',
      component: <CodeBlock />,
    },
    {
      label: 'python',
      component: <CodeBlock />,
    },
  ];

  return (
    <section className={classes.wrapper}>
      <Typography variant="h5" className={classes.title}>
        {commonTrans('code')}
      </Typography>
      <CustomTabList tabs={mockTabs} wrapperClass={classes.tabs} />
    </section>
  );
};

export default CodeView;
