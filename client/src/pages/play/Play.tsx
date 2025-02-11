import { Box, Paper } from '@mui/material';
import { useNavigationHook } from '@/hooks';
import { ALL_ROUTER_TYPES } from '@/router/consts';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@mui/material';
import { EditorState, Compartment } from '@codemirror/state';
import { EditorView, keymap, placeholder } from '@codemirror/view';
import { insertTab } from '@codemirror/commands';
import { indentUnit } from '@codemirror/language';
import { basicSetup } from 'codemirror';
import { autocompletion, CompletionContext } from '@codemirror/autocomplete';
import { getStyles, getCMStyle } from './style';

function myCompletions(context: CompletionContext) {
  let word = context.matchBefore(/\w*/)!;
  if (word.from == word.to && !context.explicit) return null;
  return {
    from: word.from,
    options: [
      { label: 'world' },
      { label: 'hello' },
      { label: 'hello2' },
      { label: 'magic', apply: '⠁⭒*.✩.*⭒⠁' },
    ],
  };
}

const Play: any = () => {
  // hooks
  const theme = useTheme();
  useNavigationHook(ALL_ROUTER_TYPES.PLAY);
  // styles
  const classes = getStyles();
  const [code, setCode] = useState('POST /collections');
  // refs
  const editorEl = useRef<HTMLDivElement>(null);
  const editor = useRef<EditorView>();
  const themeCompartment = useRef(new Compartment()).current;

  // create editor
  useEffect(() => {
    if (!editor.current) {
      // create editor
      const startState = EditorState.create({
        doc: code,
        extensions: [
          basicSetup,
          placeholder('Write your code here'),
          keymap.of([{ key: 'Tab', run: insertTab }]), // fix tab behaviour
          indentUnit.of('  '), // fix tab indentation
          EditorView.lineWrapping,
          themeCompartment.of([]), // empty theme
          autocompletion({
            override: [myCompletions],
          }), // auto completion
        ],
      });

      // create editor view
      const view = new EditorView({
        state: startState,
        parent: editorEl.current!,
      });

      // set editor ref
      editor.current = view;
    } else {
      if (editor.current.state.doc.toString() !== code) {
        editor.current.dispatch({
          changes: {
            from: 0,
            to: editor.current.state.doc.length,
            insert: code,
          },
        });
      }
    }

    return () => {};
  }, [code]);

  useEffect(() => {
    if (editor.current) {
      const newTheme = EditorView.theme(getCMStyle(theme));

      editor.current.dispatch({
        effects: themeCompartment.reconfigure(newTheme),
      });
    }
  }, [theme.palette.mode]);

  return (
    <Box className={classes.root}>
      <Paper elevation={0} className={classes.leftPane}>
        <div
          ref={editorEl}
          defaultValue={code}
          className={classes.editor}
        ></div>
      </Paper>

      <Paper elevation={0} className={classes.rightPane}>
        code response here...
      </Paper>
    </Box>
  );
};

export default Play;
