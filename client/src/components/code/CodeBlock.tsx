import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import CopyButton from '../advancedSearch/CopyButton';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { vs2015, github } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { FC } from 'react';
import { makeStyles } from '@mui/styles';
import type { Theme } from '@mui/material/styles';
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
  style = {},
}) => {
  const theme = useTheme();
  const classes = getStyles();
  const { t: commonTrans } = useTranslation();
  const highlightTheme = theme.palette.mode === 'dark' ? vs2015 : github;

  return (
    <div className={`${classes.wrapper} ${wrapperClass}`}>
      <CopyButton
        className={classes.copy}
        label={commonTrans('copy.label')}
        value={code}
      />
      <SyntaxHighlighter
        language={language}
        style={{ ...highlightTheme, ...style }}
        customStyle={CodeStyle}
        showLineNumbers
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeBlock;
