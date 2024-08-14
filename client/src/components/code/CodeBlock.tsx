import { Theme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import CopyButton from '../advancedSearch/CopyButton';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { githubGist } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { FC } from 'react';
import { CodeBlockProps } from './Types';
import { makeStyles } from '@mui/styles';

const getStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    position: 'relative',
    backgroundColor: '#fff',
    color: '#454545',
  },
  copy: {
    position: 'absolute',
    top: theme.spacing(1),
    right: theme.spacing(1),
    '& svg': {
      width: 16,
    },
  },
}));

const CodeStyle = {
  backgroundColor: '#f5f5f5',
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
        style={githubGist}
        customStyle={CodeStyle}
        showLineNumbers={true}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeBlock;
