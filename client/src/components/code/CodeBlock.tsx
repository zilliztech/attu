import { Theme, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import CopyButton from '../advancedSearch/CopyButton';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { vs2015, github } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { FC } from 'react';
import { makeStyles } from '@mui/styles';
import type { CodeBlockProps } from './Types';

const getStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    position: 'relative',
    backgroundColor: theme.palette.background.paper,
  },
  copy: {
    position: 'absolute',
    top: theme.spacing(1),
    right: theme.spacing(1),
    '& svg': {
      width: 16,
      height: 16,
    },
  },
}));

const CodeStyle = {
  fontSize: 12,
};

const CodeBlock: FC<CodeBlockProps> = ({
  code,
  language,
  wrapperClass = '',
}) => {
  const theme = useTheme();
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
        style={theme.palette.mode === 'dark' ? vs2015 : github}
        customStyle={CodeStyle}
        showLineNumbers={true}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeBlock;
