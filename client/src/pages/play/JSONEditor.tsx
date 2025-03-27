import { EditorView, ViewUpdate } from '@codemirror/view';
import { FC, useRef, useMemo } from 'react';
import { useTheme } from '@mui/material';
import { json, jsonParseLinter } from '@codemirror/lang-json';
import { linter } from '@codemirror/lint';

import { useCodeMirror } from './hooks/use-codemirror';
import { jsonFoldGutter } from './language/extensions/fold';

import { getCMStyle, getStyles } from './style';
import {
  HighlightStyle,
  StreamLanguage,
  syntaxHighlighting,
} from '@codemirror/language';
import { json as jsonMode } from '@codemirror/legacy-modes/mode/javascript';
import { tags } from '@lezer/highlight';

const getJsonHighlightStyle = (isDarkMode: boolean) =>
  HighlightStyle.define([
    { tag: tags.string, color: isDarkMode ? '#9CDCFE' : '#085bd7' },
    { tag: tags.number, color: isDarkMode ? '#50fa7b' : '#0c7e5e' },
    { tag: tags.bool, color: '#a00' },
    { tag: tags.null, color: '#a00' },
    { tag: tags.propertyName, color: '#a0a' },
    { tag: tags.punctuation, color: '#555' },
  ]);

type Props = {
  value: string;
  editable?: boolean;
  onChange?: (value: string) => void;
};

export const JSONEditor: FC<Props> = props => {
  const { value, editable = true, onChange } = props;
  const theme = useTheme();
  const container = useRef<HTMLDivElement>(null);
  const classes = getStyles();

  const isDarkMode = theme.palette.mode === 'dark';

  const extensions = useMemo(() => {
    return [
      EditorView.lineWrapping,
      EditorView.editable.of(editable),
      EditorView.theme(getCMStyle(theme)),
      StreamLanguage.define(jsonMode as any),
      syntaxHighlighting(getJsonHighlightStyle(isDarkMode)),
      json(),
      jsonFoldGutter(),
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
