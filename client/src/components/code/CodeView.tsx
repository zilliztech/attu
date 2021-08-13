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
    /**
     * container height minus:
     * 1. CodeView padding top and bottom (32 * 2)
     * 2. CodeBlock padding top and bottom (24 * 2)
     * 3. title height and margin bottom (24 + 16)
     * 4. tab title height and margin bottom (36 + 16)
     */
    height: (props: { height: number }) =>
      props.height - 32 * 2 - 24 * 2 - (24 + 16) - (36 + 16),
    overflowY: 'auto',
  },
}));

const CodeView: FC<CodeViewProps> = ({
  wrapperClass = '',
  data,
  height = 0,
}) => {
  const classes = getStyles({ height });
  const { t: commonTrans } = useTranslation();

  const tabs: ITab[] = data.map(item => ({
    label: item.label,
    component: (
      <CodeBlock
        wrapperClass={height !== 0 ? classes.block : ''}
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
