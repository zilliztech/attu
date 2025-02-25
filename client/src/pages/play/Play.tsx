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
import { ATTU_PLAY_CODE, CLOUD_API_BASE_URL } from '@/consts';
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
    return savedCode || '';
  });

  // refs
  const container = useRef<HTMLDivElement>(null);

  const content = detail.error
    ? JSON.stringify(detail.error, null, 2)
    : JSON.stringify(detail.response, null, 2);
  const emptyClass = !detail.response && !detail.error ? classes.empty : '';

  const extensions = useMemo(() => {
    const { address, token, username, password } = authReq;
    const getBaseUrl = () => {
      if (isManaged) {
        return CLOUD_API_BASE_URL;
      }
      return address.startsWith('http') ? address : `http://${address}`;
    };
    return [
      placeholder('Write your code here'),
      EditorView.lineWrapping,
      EditorView.theme(getCMStyle(theme)),
      KeyMap(),
      MilvusHTTP({ baseUrl: getBaseUrl(), token, username, password }),
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
    if (detail.response || detail.error) {
      return (
        <CodeBlock
          wrapperClass={classes.response}
          language="json"
          code={content}
        />
      );
    }
    return <p>Response result.</p>;
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

      <Paper elevation={0} className={`${classes.rightPane} ${emptyClass}`}>
        {renderResponse()}
      </Paper>
    </Box>
  );
};

export default Play;
