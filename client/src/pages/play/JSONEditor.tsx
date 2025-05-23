import { EditorView } from '@codemirror/view';
import { FC, useRef, useMemo } from 'react';
import { useTheme } from '@mui/material';
import { json, jsonParseLinter } from '@codemirror/lang-json';
import { linter } from '@codemirror/lint';
import { githubLight } from '@ddietr/codemirror-themes/github-light';
import { githubDark } from '@ddietr/codemirror-themes/github-dark';
import { Compartment } from '@codemirror/state';
import { styled } from '@mui/material/styles';

import { useCodeMirror } from './hooks/use-codemirror';
import { getCMStyle } from './style';

const EditorContainer = styled('div')({
  height: '100%',
  overflow: 'auto',
  '& .cm-editor': {
    height: '100%',
  },
  '& .cm-scroller': {
    overflow: 'auto',
  },
});

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

  return <EditorContainer ref={container} />;
};
