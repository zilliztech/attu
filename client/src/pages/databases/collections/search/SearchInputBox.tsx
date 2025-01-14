import { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { EditorState, Compartment } from '@codemirror/state';
import { EditorView, keymap, placeholder } from '@codemirror/view';
import { insertTab } from '@codemirror/commands';
import { indentUnit } from '@codemirror/language';
import { minimalSetup } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { linter, Diagnostic } from '@codemirror/lint';
import { CollectionService } from '@/http';
import { DataTypeStringEnum } from '@/consts';
import { getQueryStyles } from './Styles';
import { useTheme } from '@mui/material';
import { githubLight } from '@ddietr/codemirror-themes/github-light';
import { githubDark } from '@ddietr/codemirror-themes/github-dark';
import { Validator } from './utils';
import type { CollectionFullObject } from '@server/types';
import type { SearchSingleParams } from '../../types';

export type SearchInputBoxProps = {
  onChange: (anns_field: string, value: string) => void;
  searchParams: SearchSingleParams;
  collection: CollectionFullObject;
  type?: 'vector' | 'text';
};

let queryTimeout: NodeJS.Timeout;

export default function SearchInputBox(props: SearchInputBoxProps) {
  const theme = useTheme();
  const { t: searchTrans } = useTranslation('search');

  // props
  const { searchParams, onChange, collection, type } = props;
  const { field, data } = searchParams;

  // classes
  const classes = getQueryStyles();

  // refs
  const editorEl = useRef<HTMLDivElement>(null);
  const editor = useRef<EditorView>();
  const onChangeRef = useRef(onChange);
  const dataRef = useRef(data);
  const fieldRef = useRef(field);
  const searchParamsRef = useRef(searchParams);

  const themeCompartment = new Compartment();

  // get validator
  const validator = Validator[field.data_type as keyof typeof Validator];

  useEffect(() => {
    // update dataRef and onChangeRef when data changes
    dataRef.current = data;
    onChangeRef.current = onChange;
    fieldRef.current = field;
    searchParamsRef.current = searchParams;
  }, [JSON.stringify(searchParams), onChange]);

  const getVectorById = (text: string) => {
    if (queryTimeout) {
      clearTimeout(queryTimeout);
    }
    // only search for text that doesn't have space, comma, or brackets or curly brackets
    if (!text.trim().match(/[\s,{}]/)) {
      const isVarChar =
        collection.schema.primaryField.data_type === DataTypeStringEnum.VarChar;

      if (!isVarChar && isNaN(Number(text))) {
        return;
      }

      queryTimeout = setTimeout(() => {
        try {
          CollectionService.queryData(collection.collection_name, {
            expr: isVarChar
              ? `${collection.schema.primaryField.name} == '${text}'`
              : `${collection.schema.primaryField.name} == ${text}`,
            output_fields: [searchParamsRef.current.anns_field],
          })
            .then(res => {
              if (res.data && res.data.length === 1) {
                onChangeRef.current(
                  searchParamsRef.current.anns_field,
                  JSON.stringify(
                    res.data[0][searchParamsRef.current.anns_field]
                  )
                );
              }
            })
            .catch(e => {
              console.log(0, e);
            });
        } catch (e) {}
      }, 300);
    }
  };

  // create editor
  useEffect(() => {
    if (!editor.current) {
      // update outside data timeout handler
      let updateTimeout: NodeJS.Timeout;

      let extensions = [
        minimalSetup,
        placeholder(
          searchTrans(
            type === 'text' ? 'textPlaceHolder' : 'inputVectorPlaceHolder'
          )
        ),
        keymap.of([{ key: 'Tab', run: insertTab }]), // fix tab behaviour
        indentUnit.of('    '), // fix tab indentation
        EditorView.theme({
          '&.cm-editor': {
            '&.cm-focused': {
              outline: 'none',
            },
          },
          '.cm-content': {
            fontSize: '12px',
            fontFamily: 'IBM Plex Mono, monospace',
            minHeight: '124px',
          },
          '.cm-gutters': {
            display: 'none',
          },
        }),
        EditorView.lineWrapping,
        EditorView.updateListener.of(update => {
          if (update.docChanged) {
            if (queryTimeout || updateTimeout) {
              clearTimeout(queryTimeout);
              clearTimeout(updateTimeout);
            }

            updateTimeout = setTimeout(() => {
              // get text
              const text = update.state.doc.toString();
              // validate text
              const { valid } = validator(text, fieldRef.current);
              // if valid, update search params
              if (valid || text === '' || type === 'text') {
                onChangeRef.current(searchParams.anns_field, text);
              } else {
                getVectorById(text);
              }
            }, 500);
          }
          if (update.focusChanged) {
            editorEl.current?.classList.toggle('focused', update.view.hasFocus);
          }
        }),
      ];

      if (type === 'vector') {
        extensions = [
          ...extensions,
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
        ];
      }

      // create editor
      const startState = EditorState.create({
        doc: data,
        extensions,
      });

      // create editor view
      const view = new EditorView({
        state: startState,
        parent: editorEl.current!,
      });

      // set editor ref
      editor.current = view;
    } else {
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

    return () => {};
  }, [JSON.stringify({ field, data })]);

  useEffect(() => {
    // dispatch dark mode change to editor
    if (editor.current) {
      editor.current.dispatch({
        effects: themeCompartment.reconfigure(
          themeCompartment.of(
            theme.palette.mode === 'light' ? githubLight : githubDark
          )
        ),
      });
    }
  }, [theme.palette.mode]);

  return <div className={classes.searchInputBox} ref={editorEl}></div>;
}
