import { makeStyles, Theme } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import CopyButton from '../advancedSearch/CopyButton';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const getStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    position: 'relative',
    padding: theme.spacing(3),
    borderRadius: 8,
    backgroundColor: '#fff',
    color: '#454545',
  },
  block: {
    margin: 0,
  },
  copy: {
    position: 'absolute',
    top: theme.spacing(2),
    right: theme.spacing(2),
  },
}));

const code = `
const a = 2;
const testFunction = (input) => {
  console.log(input)
}
testFunction(a)`;

const CodeBlock = () => {
  const classes = getStyles();

  const { t: commonTrans } = useTranslation();
  const copyTrans = commonTrans('copy', { returnObjects: true });

  return (
    <div className={classes.wrapper}>
      <CopyButton
        className={classes.copy}
        label={copyTrans.label}
        value="code block"
      />
      <SyntaxHighlighter language="javascript" style={docco}>
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeBlock;
