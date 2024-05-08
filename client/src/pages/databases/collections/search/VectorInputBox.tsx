import { useRef, useEffect } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { insertTab } from '@codemirror/commands';
import { indentUnit, syntaxTree } from '@codemirror/language';
import { basicSetup } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { linter, Diagnostic } from '@codemirror/lint';

export default function VectorInputBox() {
  const editorEl = useRef<HTMLDivElement>(null); // Adjusted type here
  const editor = useRef<EditorView>();

  useEffect(() => {
    if (editor.current) return;
    let startState = EditorState.create({
      doc: '\n\n\n\n\n\n',
      extensions: [
        basicSetup,
        javascript(),
        linter(view => {
          let diagnostics: Diagnostic[] = [];
          syntaxTree(view.state)
            .cursor()
            .iterate(node => {
              if (node.name == 'RegExp')
                diagnostics.push({
                  from: node.from,
                  to: node.to,
                  severity: 'warning',
                  message: 'Regular expressions are FORBIDDEN',
                  actions: [
                    {
                      name: 'Remove',
                      apply(view, from, to) {
                        view.dispatch({ changes: { from, to } });
                      },
                    },
                  ],
                });
            });
          return diagnostics;
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
            backgroundColor: 'rgba(10, 206, 130, 0.08)',
          },
        }),
        EditorView.baseTheme({
          '&light .cm-selectionBackground': {
            backgroundColor: 'rgb(195,222,252)',
          },
          '&light.cm-focused .cm-selectionBackground': {
            backgroundColor: 'rgb(195,222,252)',
          },
          '&light .cm-activeLineGutter': {
            backgroundColor: 'transparent',
            fontWeight: 'bold',
          },
        }),
      ],
    });

    editor.current = new EditorView({
      state: startState,
      parent: editorEl.current!,
    });
  }, []);

  const containerStyle = {
    height: '126px',
    margin: '0 0 8px 0',
    overflow: 'auto',
    backgroundColor: 'rgba(10, 206, 130, 0.08)',
  };

  return <div ref={editorEl} style={containerStyle}></div>;
}
