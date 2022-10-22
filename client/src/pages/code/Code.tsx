import { FC, useRef, useEffect, useCallback, useState } from 'react';
import { useNavigationHook } from '../../hooks/Navigation';
import { ALL_ROUTER_TYPES } from '../../router/Types';
import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { basicSetup, TabKeyBindings } from './modules/extensions';
import { theme, baseTheme, highlights } from './modules/theme';

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

const Code: FC<any> = () => {
  useNavigationHook(ALL_ROUTER_TYPES.CODE);
  const editorEl = useRef<HTMLDivElement>(null);
  const editor = useRef<any>(null);

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
      <div ref={editorEl}></div>
    </section>
  );
};

export default Code;
