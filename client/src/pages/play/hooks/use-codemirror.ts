import {
  EditorState,
  Extension,
  Annotation,
  StateEffect,
} from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { useState, useEffect } from 'react';
import {
  lineNumbers,
  highlightActiveLineGutter,
} from '../language/extensions/gutter';
import {
  highlightSpecialChars,
  drawSelection,
  dropCursor,
  rectangularSelection,
  crosshairCursor,
  highlightActiveLine,
  keymap,
} from '@codemirror/view';
export { EditorView } from '@codemirror/view';
import {
  foldGutter,
  indentOnInput,
  syntaxHighlighting,
  defaultHighlightStyle,
  bracketMatching,
  foldKeymap,
} from '@codemirror/language';
import { history, defaultKeymap, historyKeymap } from '@codemirror/commands';
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search';
import {
  closeBrackets,
  autocompletion,
  closeBracketsKeymap,
  completionKeymap,
} from '@codemirror/autocomplete';
import { lintKeymap } from '@codemirror/lint';

const basicSetup = () => [
  lineNumbers(),
  highlightActiveLineGutter(),
  highlightSpecialChars(),
  history(),
  foldGutter(),
  drawSelection(),
  dropCursor(),
  EditorState.allowMultipleSelections.of(true),
  indentOnInput(),
  syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
  bracketMatching(),
  closeBrackets(),
  autocompletion(),
  rectangularSelection(),
  crosshairCursor(),
  highlightActiveLine(),
  highlightSelectionMatches(),
  keymap.of([
    ...closeBracketsKeymap,
    ...defaultKeymap,
    ...searchKeymap,
    ...historyKeymap,
    ...foldKeymap,
    ...completionKeymap,
    ...lintKeymap,
  ]),
];

const External = Annotation.define<boolean>();

export interface UseCodeMirrorProps {
  container?: HTMLDivElement | null;
  value?: string;
  extensions?: Extension[];
  onChange?: (value: string) => void;
}

export const useCodeMirror = (props: UseCodeMirrorProps) => {
  const { value, extensions, onChange } = props;

  const [container, setContainer] = useState<HTMLDivElement | null>();
  const [view, setView] = useState<EditorView>();

  const updateListener = EditorView.updateListener.of(update => {
    if (update.changes) {
      onChange?.(update.state.doc.toString());
    }
  });

  const getExtensions = () => {
    return [updateListener, basicSetup(), ...(extensions ?? [])];
  };

  // init editor
  useEffect(() => {
    if (container && !view) {
      const startState = EditorState.create({
        doc: value,
        extensions: getExtensions(),
      });

      const editorView = new EditorView({
        state: startState,
        parent: container,
      });
      setView(editorView);
    }

    return () => {};
  }, [container]);

  // update value
  useEffect(() => {
    if (value === undefined) {
      return;
    }

    const currentValue = view?.state.doc.toString() ?? '';
    if (view && value !== currentValue) {
      view.dispatch({
        changes: {
          from: 0,
          to: currentValue.length,
          insert: value || '',
        },
        annotations: [External.of(true)],
      });
    }
  }, [value]);

  // update extensions
  useEffect(() => {
    if (view) {
      view.dispatch({
        effects: [StateEffect.reconfigure.of(getExtensions())],
      });
    }
  }, [extensions, view]);

  useEffect(() => setContainer(props.container), [props.container]);

  return { view };
};
