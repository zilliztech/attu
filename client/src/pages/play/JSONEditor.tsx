import { EditorView } from '@codemirror/view';
import { FC, useRef, useMemo } from 'react';
import { useTheme } from '@mui/material';
import { json, jsonParseLinter } from '@codemirror/lang-json';
import { linter } from '@codemirror/lint';
import { githubLight } from '@ddietr/codemirror-themes/github-light';
import { githubDark } from '@ddietr/codemirror-themes/github-dark';
import { Compartment } from '@codemirror/state';

import { useCodeMirror } from './hooks/use-codemirror';
import { getCMStyle, getStyles } from './style';

type Props = {
  value: string;
  editable?: boolean;
  onChange?: (value: string) => void;
};

export const JSONEditor: FC<Props> = props => {
  const { value, editable = true, onChange } = props;
  const theme = useTheme();
  const themeCompartment = new Compartment();
  const container = useRef<HTMLDivElement>(null);
  const classes = getStyles();

  const isDarkMode = theme.palette.mode === 'dark';

  const extensions = useMemo(() => {
    return [
      EditorView.lineWrapping,
      EditorView.editable.of(editable),
      EditorView.theme(getCMStyle(theme)),
      themeCompartment.of(isDarkMode ? githubDark : githubLight),
      json(),
      linter(jsonParseLinter()),
    ];
  }, [theme.palette.mode, isDarkMode, editable]);

  useCodeMirror({
    container: container.current,
    value,
    extensions,
    onChange,
  });

  return <div ref={container} className={classes.editor}></div>;
};
