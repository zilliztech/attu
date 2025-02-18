import { Box, Paper } from '@mui/material';
import { useNavigationHook } from '@/hooks';
import { ALL_ROUTER_TYPES } from '@/router/consts';
import { useState, useEffect, useRef, FC, useContext } from 'react';
import { useTheme } from '@mui/material';

import { EditorState, Compartment, StateEffect } from '@codemirror/state';
import { EditorView, placeholder } from '@codemirror/view';
import { indentUnit } from '@codemirror/language';
import { basicSetup } from 'codemirror';
import { getStyles, getCMStyle } from './style';
import { ATTU_PLAY_CODE } from '@/consts';
import { MilvusHTTP } from './language/milvus.http';
import { Autocomplete } from './language/extensions/autocomplete';
import CodeBlock from '@/components/code/CodeBlock';
import { type PlaygroundExtensionParams, type PlaygroundCustomEventDetail, CustomEventNameEnum } from './Types';
import { DocumentEventManager } from './utils/event';
import { KeyMap } from './language/extensions/keymap';
import { dataContext } from '@/context';

type Props = PlaygroundExtensionParams

const Play: FC<Props> = (props) => {
  // hooks
  const theme = useTheme();
  useNavigationHook(ALL_ROUTER_TYPES.PLAY);
  const [detail, setDetail] = useState<PlaygroundCustomEventDetail>({} as PlaygroundCustomEventDetail);
  const { collections, databases, loading } = useContext(dataContext);
  // styles
  const classes = getStyles();
  const [code, setCode] = useState(() => {
    const savedCode = localStorage.getItem(ATTU_PLAY_CODE);
    return savedCode || '';
  });
  // refs
  const editorEl = useRef<HTMLDivElement>(null);
  const editor = useRef<EditorView>();
  const themeCompartment = useRef(new Compartment()).current;

  const content = detail.error
    ? JSON.stringify(detail.error, null, 2)
    : JSON.stringify(detail.response, null, 2)
  const emptyClass = !detail.response && !detail.error ? classes.empty : '';

  // save code to local storage
  useEffect(() => {
    localStorage.setItem(ATTU_PLAY_CODE, code);
  }, [code]);

  const getExtensions = () => {
    return [
      basicSetup,
      placeholder('Write your code here'),
      indentUnit.of('  '), // fix tab indentation
      EditorView.lineWrapping,
      themeCompartment.of([]), // empty theme
      EditorView.updateListener.of(update => {
        if (update.changes) {
          setCode(update.state.doc.toString());
        }
      }),
      KeyMap(),
      MilvusHTTP(props),
      Autocomplete({ databases, collections }),
    ]
  }

  // create editor
  useEffect(() => {
    if (!editor.current) {
      // create editor
      const startState = EditorState.create({
        doc: code,
        extensions: getExtensions(),
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
    if (!loading) {
      editor.current?.dispatch({
        effects: [StateEffect.reconfigure.of(getExtensions())],
      });
    }
  }, [databases, collections, loading]);

  useEffect(() => {
    if (editor.current) {
      const newTheme = EditorView.theme(getCMStyle(theme));

      editor.current.dispatch({
        effects: themeCompartment.reconfigure(newTheme),
      });
    }
  }, [theme.palette.mode]);

  useEffect(() => {
    const handleCodeMirrorResponse = (event: Event) => {
      const { detail } = event as CustomEvent<PlaygroundCustomEventDetail>
      setDetail(detail);
    };

    const unsubscribe = DocumentEventManager.subscribe(
      CustomEventNameEnum.PlaygroundResponseDetail,
      handleCodeMirrorResponse
    );

    return () => {
      unsubscribe();
    };
  }, []);

  const renderResponse = () => {
    if (detail.response || detail.error) {
      return (
        <CodeBlock
          wrapperClass={classes.response}
          language='json'
          code={content}
        />
      );
    }
    return (
      <p>Response result.</p>
    )
  }

  return (
    <Box className={classes.root}>
      <Paper elevation={0} className={classes.leftPane}>
        <div
          ref={editorEl}
          defaultValue={code}
          className={classes.editor}
        ></div>
      </Paper>

      <Paper elevation={0} className={`${classes.rightPane} ${emptyClass}`}>
        {renderResponse()}
      </Paper>
    </Box>
  );
};

export default Play;
