import { FC, useRef, useEffect, useCallback, useState } from 'react';
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

const doc = `const params = {
  collection_name: "book",
  description: "Test book search"
  fields: [
    {
      name: "book_intro",
      description: "",
      data_type: 101,  // DataType.FloatVector
      type_params: {
        dim: "2",
      },
    },
	{
      name: "book_id",
      data_type: 5,   //DataType.Int64
      is_primary_key: true,
      description: "",
    },
    {
      name: "word_count",
      data_type: 5,    //DataType.Int64
      description: "",
    },
  ],
};
`;

const operationTypes = [
  { label: 'Create collection', value: 'create' },
  { label: 'Create index', value: 'index' },
  { label: 'Load collection', value: 'data' },
  { label: 'Insert data', value: 'data' },
  { label: 'Vector search', value: 'search' },
];
const sdks = [
  { label: 'Pymilvus', value: 'python' },
  { label: 'Nodejs', value: 'nodejs' },
];

const Code: FC<any> = () => {
  useNavigationHook(ALL_ROUTER_TYPES.CODE);
  // init state
  const editorEl = useRef<HTMLDivElement>(null);
  const editor = useRef<any>(null);

  // style
  const classes = getPlaygroundStyles();
  const RunIcon = icons.play;
  const CopyIcon = icons.copy;

  // editor
  useEffect(() => {
    if (editor.current) return;

    let state = EditorState.create({
      doc: doc,
      extensions: [basicSetup, TabKeyBindings, theme, baseTheme, highlights],
    });

    // init view
    editor.current = new EditorView({
      state,
      parent: editorEl.current as any,
    });
  }, []);

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
          value={operationTypes[0].value}
          onChange={() => {}}
        />
        <CustomSelector
          options={sdks}
          wrapperClass={classes.selector}
          variant="filled"
          disabled={false}
          label={'SDK'}
          value={sdks[0].value}
          onChange={() => {}}
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
