import { EditorView, placeholder } from '@codemirror/view';
import { Box, Paper, useTheme } from '@mui/material';
import {
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import CodeBlock from '@/components/code/CodeBlock';
import { ATTU_PLAY_CODE } from '@/consts';
import { authContext, dataContext } from '@/context';
import { useNavigationHook } from '@/hooks';
import { ALL_ROUTER_TYPES } from '@/router/consts';

import { useCodeMirror } from './hooks/use-codemirror';
import { Autocomplete } from './language/extensions/autocomplete';
import { KeyMap } from './language/extensions/keymap';
import { MilvusHTTP } from './language/milvus.http';
import { getCMStyle, getStyles } from './style';
import { CustomEventNameEnum, PlaygroundCustomEventDetail } from './Types';
import { DocumentEventManager } from './utils/event';
import { DEFAULT_CODE_VALUE } from '@/pages/play/Constants';

const Play: FC = () => {
  // hooks
  const theme = useTheme();
  useNavigationHook(ALL_ROUTER_TYPES.PLAY);
  const [detail, setDetail] = useState<PlaygroundCustomEventDetail>(
    {} as PlaygroundCustomEventDetail
  );
  const { collections, databases, loading } = useContext(dataContext);
  const { isManaged, authReq } = useContext(authContext);

  // styles
  const classes = getStyles();
  const [code, setCode] = useState(() => {
    const savedCode = localStorage.getItem(ATTU_PLAY_CODE);
    return savedCode || DEFAULT_CODE_VALUE;
  });

  // refs
  const container = useRef<HTMLDivElement>(null);

  const content = detail.error
    ? JSON.stringify(detail.error, null, 2)
    : JSON.stringify(detail.response, null, 2);

  const extensions = useMemo(() => {
    const { address, token, username, password } = authReq;

    const getBaseUrl = () => {
      if (!address.startsWith('http')) {
        if (!/:(\d+)/.test(address)) {
          return `http://${address}:19530`;
        }
        return `http://${address}`;
      }

      return address;
    };
    return [
      placeholder('Write your code here'),
      EditorView.lineWrapping,
      EditorView.theme(getCMStyle(theme)),
      KeyMap(),
      MilvusHTTP({
        baseUrl: getBaseUrl(),
        token,
        username,
        password,
        isManaged,
        isDarkMode: theme.palette.mode === 'dark',
      }),
      Autocomplete({ databases, collections }),
    ];
  }, [databases, collections, authReq, theme.palette.mode]);

  const handleCodeChange = useCallback((code: string) => {
    setCode(code);
  }, []);

  useCodeMirror({
    container: container.current,
    value: code,
    extensions,
    onChange: handleCodeChange,
  });

  // save code to local storage
  useEffect(() => {
    if (code === '') {
      localStorage.removeItem(ATTU_PLAY_CODE);
      return;
    }
    localStorage.setItem(ATTU_PLAY_CODE, code);
  }, [code]);

  useEffect(() => {
    const handleCodeMirrorResponse = (event: Event) => {
      const { detail } = event as CustomEvent<PlaygroundCustomEventDetail>;
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
    const style =
      theme.palette.mode !== 'dark'
        ? {
            hljs: {
              display: 'block',
              overflowX: 'auto' as const,
              padding: '12px 0',
              color: '#333',
              margin: 0,
              background: theme.palette.background.paper,
            },
          }
        : undefined;
    return (
      <CodeBlock
        wrapperClass={classes.response}
        language="json"
        code={content || '{}'}
        style={style}
      />
    );
  };

  return (
    <Box className={classes.root}>
      <Paper elevation={0} className={classes.leftPane}>
        <div
          ref={container}
          defaultValue={code}
          className={classes.editor}
        ></div>
      </Paper>

      <Paper elevation={0} className={classes.rightPane}>
        {renderResponse()}
      </Paper>
    </Box>
  );
};

export default Play;
