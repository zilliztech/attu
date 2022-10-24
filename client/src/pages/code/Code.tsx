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
import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { basicSetup, TabKeyBindings } from './modules/extensions';
import { theme, baseTheme, highlights } from './modules/theme';
import icons from '../../components/icons/Icons';
import CustomButton from '../../components/customButton/CustomButton';
import CustomSelector from '../../components/customSelector/CustomSelector';
import { getPlaygroundStyles } from './Styles';
import { BUILD_INDEX } from './examples/buildIndex';
import { CREATE_COLLECTION } from './examples/createCollection';
import { INSERT_DATA } from './examples/insertData';
import { LOAD_COLLECTION } from './examples/loadCollection';
import { VECTOR_SEARCH } from './examples/vectorSearch';

const operationTypes = [
  { label: 'Create collection', value: 'CREATE_COLLECTION' },
  { label: 'Build index', value: 'BUILD_INDEX' },
  { label: 'Load collection', value: 'LOAD_COLLECTION' },
  { label: 'Insert data', value: 'INSERT_DATA' },
  { label: 'Vector search', value: 'VECTOR_SEARCH' },
];
const langs = [
  { label: 'Python', value: 'python' },
  { label: 'Nodejs', value: 'nodejs' },
];

const Code: FC<any> = () => {
  useNavigationHook(ALL_ROUTER_TYPES.CODE);
  // init state
  const [operationType, setOperationType] = useState(operationTypes[0].value);
  const [lang, setLang] = useState<string>(langs[0].value);
  const editorEl = useRef<HTMLDivElement>(null);
  const editor = useRef<any>(null);
  const docMap = {
    BUILD_INDEX,
    CREATE_COLLECTION,
    INSERT_DATA,
    LOAD_COLLECTION,
    VECTOR_SEARCH,
  };

  // style
  const classes = getPlaygroundStyles();
  const RunIcon = icons.play;
  const CopyIcon = icons.copy;

  // editor
  useEffect(() => {
    console.log(1);
    const doc: string = docMap[operationType][lang];
    let state = EditorState.create({
      doc: doc,
      extensions: [basicSetup, TabKeyBindings, theme, baseTheme, highlights],
    });
    if (editor.current) {
      editor.current.setState(state);
      return;
    }

    // init view
    editor.current = new EditorView({
      state,
      parent: editorEl.current as Element,
    });
  }, [operationType, lang, docMap]);

  // operation change
  const handleOperationChange = (event: ChangeEvent<{ value: string }>) => {
    setOperationType(event.target.value);
    console.log(event.target.value);
  };

  // language change
  const handleLangChange = (event: ChangeEvent<{ value: string }>) => {
    setLang(event.target.value);
    console.log(event.target.value);
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
          options={operationTypes}
          wrapperClass={classes.selector}
          variant="filled"
          label={'Milvus operations'}
          disabled={false}
          value={operationType}
          onChange={handleOperationChange}
        />
        <CustomSelector
          options={langs}
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
