import { useRef, useEffect, useState } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { insertTab } from '@codemirror/commands';
import { indentUnit } from '@codemirror/language';
import { minimalSetup } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { linter, Diagnostic } from '@codemirror/lint';
import { FieldObject } from '@server/types';
import { DataTypeStringEnum } from '@/consts';
import { SearchSingleParams } from '../../types';
import { isSparseVector, transformObjStrToJSONStr } from '@/utils';

const floatVectorValidator = (text: string, field: FieldObject) => {
  try {
    const value = JSON.parse(text);
    const dim = field.dimension;
    if (!Array.isArray(value)) {
      return {
        valid: false,
        message: `Not an array`,
      };
    }

    if (Array.isArray(value) && value.length !== dim) {
      return {
        valid: false,
        value: undefined,
        message: `Dimension ${value.length} is not equal to ${dim} `,
      };
    }

    return { valid: true, message: ``, value: value };
  } catch (e: any) {
    return {
      valid: false,
      message: `Wrong Float Vector format, it should be an array of ${field.dimension} numbers`,
    };
  }
};

const binaryVectorValidator = (text: string, field: FieldObject) => {
  try {
    const value = JSON.parse(text);
    const dim = field.dimension;
    if (!Array.isArray(value)) {
      return {
        valid: false,
        message: `Not an array`,
      };
    }

    if (Array.isArray(value) && value.length !== dim / 8) {
      return {
        valid: false,
        value: undefined,
        message: `Dimension ${value.length} is not equal to ${dim / 8} `,
      };
    }

    return { valid: true, message: ``, value: value };
  } catch (e: any) {
    return {
      valid: false,
      message: `Wrong Binary Vector format, it should be an array of ${
        field.dimension / 8
      } numbers`,
    };
  }
};

const sparseVectorValidator = (text: string, field: FieldObject) => {
  if (!isSparseVector(text)) {
    return {
      valid: false,
      value: undefined,
      message: `Incorrect Sparse Vector format, it should be like {1: 0.1, 3: 0.2}`,
    };
  }
  try {
    JSON.parse(transformObjStrToJSONStr(text));
    return {
      valid: true,
      message: ``,
    };
  } catch (e: any) {
    return {
      valid: false,
      message: `Wrong Sparse Vector format`,
    };
  }
};

const Validator = {
  [DataTypeStringEnum.FloatVector]: floatVectorValidator,
  [DataTypeStringEnum.BinaryVector]: binaryVectorValidator,
  [DataTypeStringEnum.Float16Vector]: floatVectorValidator,
  [DataTypeStringEnum.BFloat16Vector]: floatVectorValidator,
  [DataTypeStringEnum.SparseFloatVector]: sparseVectorValidator,
};

export type VectorInputBoxProps = {
  onChange: (anns_field: string, value: string) => void;
  searchParams: SearchSingleParams;
};

export default function VectorInputBox(props: VectorInputBoxProps) {
  // props
  const { searchParams, onChange } = props;
  const { field, data } = searchParams;

  // UI states
  const [isFocused, setIsFocused] = useState(false);

  // refs
  const editorEl = useRef<HTMLDivElement>(null);
  const editor = useRef<EditorView>();
  const onChangeRef = useRef(onChange);
  const dataRef = useRef(data);
  const fieldRef = useRef(field);

  // get validator
  const validator = Validator[field.data_type as keyof typeof Validator];

  useEffect(() => {
    // update dataRef and onChangeRef when data changes
    dataRef.current = data;
    onChangeRef.current = onChange;
    fieldRef.current = field;

    if (editor.current) {
      // only data replace should trigger this, otherwise, let cm handle the state
      if (editor.current.state.doc.toString() !== data) {
        editor.current.dispatch({
          changes: {
            from: 0,
            to: editor.current.state.doc.length,
            insert: data,
          },
        });
      }
    }
  }, [JSON.stringify(searchParams)]);

  // create editor
  useEffect(() => {
    if (!editor.current) {
      const startState = EditorState.create({
        doc: data,
        extensions: [
          minimalSetup,
          javascript(),
          linter(view => {
            const text = view.state.doc.toString();

            // ignore empty text
            if (!text) return [];

            // validate
            const { valid, message } = validator(text, field);

            // if invalid, draw a red line
            if (!valid) {
              let diagnostics: Diagnostic[] = [];

              diagnostics.push({
                from: 0,
                to: view.state.doc.line(view.state.doc.lines).to,
                severity: 'error',
                message: message,
                actions: [
                  {
                    name: 'Remove',
                    apply(view, from, to) {
                      view.dispatch({ changes: { from, to } });
                    },
                  },
                ],
              });

              return diagnostics;
            } else {
              // onChangeRef.current(searchParams.anns_field, value);
              return [];
            }
          }),
          keymap.of([{ key: 'Tab', run: insertTab }]), // fix tab behaviour
          indentUnit.of('    '), // fix tab indentation
          EditorView.theme({
            '&.cm-editor': {
              '&.cm-focused': {
                outline: 'none',
              },
            },
            '.cm-content': {
              color: '#484D52',
              fontSize: '12px',
            },
            '.cm-gutters': {
              display: 'none',
            },
            '.cm-activeLine': {
              backgroundColor: '#f4f4f4',
            },
            '.cm-tooltip-lint': {
              width: '80%',
            },
          }),
          EditorView.baseTheme({
            '&light .cm-selectionBackground': {
              backgroundColor: '#f4f4f4',
            },
            '&light.cm-focused .cm-selectionBackground': {
              backgroundColor: '#f4f4f4',
            },
            '&light .cm-activeLineGutter': {
              backgroundColor: 'transparent',
              fontWeight: 'bold',
            },
          }),
          EditorView.lineWrapping,
          EditorView.updateListener.of(update => {
            if (update.docChanged) {
              const text = update.state.doc.toString();
              const { valid } = validator(text, fieldRef.current);
              if (valid || text === '') {
                onChangeRef.current(searchParams.anns_field, text);
              }
            }
            if (update.focusChanged) {
              setIsFocused(update.view.hasFocus);
            }
          }),
        ],
      });

      editor.current = new EditorView({
        state: startState,
        parent: editorEl.current!,
      });
    }
    return () => {
      if (editor.current) {
        editor.current.destroy();
        editor.current = undefined;
      }
    };
  }, [JSON.stringify(field)]);

  const containerStyle = {
    height: '124px',
    margin: '0 0 8px 0',
    overflow: 'auto',
    backgroundColor: '#f4f4f4',
    cursor: 'text',
    border: isFocused ? '1px solid #000' : '1px solid transparent',
  };

  return (
    <div
      ref={editorEl}
      style={containerStyle}
      onClick={() => {
        if (editor.current) editor.current.focus();
      }}
    ></div>
  );
}
