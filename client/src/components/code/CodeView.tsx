import { makeStyles, Theme, Typography } from '@material-ui/core';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import CustomTabList from '../customTabList/CustomTabList';
import CodeBlock from './CodeBlock';
import { CodeLanguageEnum, CodeViewProps } from './Types';

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

const jsCode = `const a = 2;
const testFunction = (input) => {
  console.log(input)
}
testFunction(a)`;

const pyCode = `# Python program to find the
# maximum of two numbers
  
def maximum(a, b):
  if a >= b:
      return a
  else:
      return b
      
# Driver code
a = 2
b = 4
print(maximum(a, b))`;

const CodeView: FC<CodeViewProps> = ({ wrapperClass = '' }) => {
  const classes = getStyles();
  const { t: commonTrans } = useTranslation();

  const mockTabs = [
    {
      label: 'node.js',
      component: (
        <CodeBlock language={CodeLanguageEnum.javascript} code={jsCode} />
      ),
    },
    {
      label: 'python',
      component: <CodeBlock language={CodeLanguageEnum.python} code={pyCode} />,
    },
  ];

  return (
    <section className={`${classes.wrapper} ${wrapperClass}`}>
      <Typography variant="h5" className={classes.title}>
        {commonTrans('code')}
      </Typography>
      <CustomTabList tabs={mockTabs} wrapperClass={classes.tabs} />
    </section>
  );
};

export default CodeView;
