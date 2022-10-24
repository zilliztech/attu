import {
  FC,
  useRef,
  useEffect,
  useCallback,
  useState,
  ChangeEvent,
} from 'react';
import { useNavigationHook } from '../../hooks/Navigation';
import { ALL_ROUTER_TYPES } from '../../router/Types';
import { EditorState, Compartment } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { python } from '@codemirror/lang-python';
import { javascript } from '@codemirror/lang-javascript';

import { basicSetup, TabKeyBindings } from './modules/extensions';
import { theme, baseTheme, highlights } from './modules/theme';
import icons from '../../components/icons/Icons';
import CustomButton from '../../components/customButton/CustomButton';
import CustomSelector from '../../components/customSelector/CustomSelector';
import { getPlaygroundStyles } from './Styles';
import { OPERATION_TYPES, LANGS, EXAMPLES } from './examples/index';

const Code: FC<any> = () => {
  useNavigationHook(ALL_ROUTER_TYPES.CODE);
  // init state
  const [operationType, setOperationType] = useState(OPERATION_TYPES[0].value);
  const [lang, setLang] = useState<string>(LANGS[0].value);
  const editorEl = useRef<HTMLDivElement>(null);
  const editor = useRef<any>(null);

  // style
  const classes = getPlaygroundStyles();
  const RunIcon = icons.play;
  const CopyIcon = icons.copy;
  let language = new Compartment(),
    tabSize = new Compartment();

  // editor
  useEffect(() => {
    // get code string
    const doc: string = EXAMPLES[operationType][lang];
    // create state
    const state = EditorState.create({
      doc: doc,
      extensions: [
        basicSetup,
        TabKeyBindings,
        language.of(lang === 'python' ? python() : javascript()),
        theme,
        baseTheme,
        highlights,
      ],
    });
    // if the edtior is already initialized, update state
    if (editor.current) {
      editor.current.setState(state);
      return;
    }

    // create the edtior
    editor.current = new EditorView({
      state,
      parent: editorEl.current as Element,
    });
  }, [operationType, lang, EXAMPLES]);

  // operation change
  const handleOperationChange = (event: ChangeEvent<{ value: unknown }>) => {
    setOperationType(event.target.value as string);
  };

  // language change
  const handleLangChange = (event: ChangeEvent<{ value: unknown }>) => {
    setLang(event.target.value as string);
  };

  return (
    <section className="page-wrapper">
      <section className={classes.toolbar}>
        <CustomButton className="btn" onClick={() => {}}>
          <RunIcon classes={{ root: 'icon' }} />
          RUN
          {/* {btnTrans('reset')} */}
        </CustomButton>
        <CustomButton className="btn" onClick={() => {}}>
          <CopyIcon classes={{ root: 'icon' }} />
          {/* {btnTrans('reset')} */}
        </CustomButton>
        <CustomSelector
          options={OPERATION_TYPES}
          wrapperClass={classes.selector}
          variant="filled"
          label={'Milvus operations'}
          disabled={false}
          value={operationType}
          onChange={handleOperationChange}
        />
        <CustomSelector
          options={LANGS}
          wrapperClass={`${classes.selector} ${classes.sdk}`}
          variant="filled"
          disabled={false}
          label={'Language'}
          value={lang}
          onChange={handleLangChange}
        />
      </section>
      <section className={classes.cmContainer}>
        <div ref={editorEl} className={classes.editor}></div>
        <div className={classes.result}>result</div>
      </section>
    </section>
  );
};

export default Code;
