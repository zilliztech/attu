import {
  EditorState,
  Extension,
  Annotation,
  StateEffect,
} from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { basicSetup } from 'codemirror';
import { useState, useEffect } from 'react';

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
    return [updateListener, basicSetup, ...(extensions ?? [])];
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
