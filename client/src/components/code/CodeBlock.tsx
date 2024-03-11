import { makeStyles, Theme } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import CopyButton from '../advancedSearch/CopyButton';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { FC } from 'react';
import { CodeBlockProps } from './Types';

const getStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    position: 'relative',
    padding: theme.spacing(3),
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

const CodeStyle = {
  backgroundColor: '#fff',
  padding: 0,
  margin: 0,
  marginRight: 32,
  fontSize: 14,
};

const CodeBlock: FC<CodeBlockProps> = ({
  code,
  language,
  wrapperClass = '',
}) => {
  const classes = getStyles();

  const { t: commonTrans } = useTranslation();
  const copyTrans = commonTrans('copy');

  return (
    <div className={`${classes.wrapper} ${wrapperClass}`}>
      <CopyButton
        className={classes.copy}
        label={copyTrans.label}
        value={code}
      />
      <SyntaxHighlighter
        language={language}
        style={docco}
        customStyle={CodeStyle}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeBlock;
