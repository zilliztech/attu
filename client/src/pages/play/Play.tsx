import { Theme, Box, Paper } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useNavigationHook } from '@/hooks';
import { ALL_ROUTER_TYPES } from '@/router/consts';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@mui/material';
import { EditorState, Compartment } from '@codemirror/state';
import { EditorView, keymap, placeholder } from '@codemirror/view';
import { insertTab } from '@codemirror/commands';
import { indentUnit } from '@codemirror/language';
import { basicSetup } from 'codemirror';

const getStyles = makeStyles((theme: Theme) => ({
  root: {
    margin: '0',
    position: 'relative',
    display: 'flex',
    overflow: 'hidden',
    borderRadius: 8,
    height: '100vh',
    padding: theme.spacing(2),
  },
  leftPane: {
    flex: 1,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
  },
  rightPane: {
    flex: 1,
    padding: theme.spacing(2),
    marginLeft: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.palette.background.grey,
  },
  editor: {
    width: '100%',
    height: '100%',
    border: 'none',
    outline: 'none',
    resize: 'none',
    fontSize: '16px',
    fontFamily: 'monospace',
    backgroundColor: 'transparent',
  },
}));

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
      const newTheme = EditorView.theme({
        '&.cm-editor': {
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
        },
        '.cm-line': { padding: ' 0 4px 0 15px' },
        '.cm-content': {
          fontSize: '13px',
          fontFamily: 'IBM Plex Mono, monospace',
        },
        '.cm-activeLine': { backgroundColor: 'transparent' },
        '.cm-gutters': {
          fontSize: '13px',
          backgroundColor: theme.palette.background.default,
          color: theme.palette.text.primary,
          border: 'none',
        },
        '.cm-lineNumbers .cm-gutterElement': {
          padding: '0 22px 0 26px',
        },
        '.cm-activeLineGutter': {
          backgroundColor: 'transparent',
          color: theme.palette.text.primary,
        },
        '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection':
          {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
          },
      });

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
