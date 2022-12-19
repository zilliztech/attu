import { makeStyles, Theme, Typography } from '@material-ui/core';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import CustomTabList from '../customTabList/CustomTabList';
import { ITab } from '../customTabList/Types';
import CodeBlock from './CodeBlock';
import { CodeViewProps } from './Types';

const getStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    boxSizing: 'border-box',
    width: '100%',

    padding: theme.spacing(4),
    backgroundColor: theme.palette.attuDark.main,
    borderRadius: 8,
    display: 'flex',
    flexDirection: 'column',
    color: '#fff',
  },
  title: {
    marginBottom: theme.spacing(2),
  },

  // override tab list style
  tabs: {
    minHeight: 0,

    '& .MuiTab-wrapper': {
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

      '& .tab-indicator': {
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

  block: {
    height: `calc(100% - ${theme.spacing(4.5)})`,
    overflowY: 'auto',
  },
}));

const CodeView: FC<CodeViewProps> = ({ wrapperClass = '', data }) => {
  const classes = getStyles();
  const { t: commonTrans } = useTranslation();

  const tabs: ITab[] = data.map(item => ({
    label: item.label,
    component: (
      <CodeBlock
        wrapperClass={classes.block}
        language={item.language}
        code={item.code}
      />
    ),
  }));

  return (
    <section className={`${classes.wrapper} ${wrapperClass}`}>
      <Typography variant="h5" className={classes.title}>
        {commonTrans('code')}
      </Typography>
      <CustomTabList tabs={tabs} wrapperClass={classes.tabs} />
    </section>
  );
};

export default CodeView;
