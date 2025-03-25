import { foldEffect, foldService, syntaxTree } from '@codemirror/language';
import { EditorState, StateEffect } from '@codemirror/state';
import { EditorView } from '@codemirror/view';

export const foldByLineRanges = (
  view: EditorView,
  lineRanges: Array<{ lineFrom: number; LineTo: number }>
) => {
  const effects = [];
  const { state } = view;

  for (const { lineFrom, LineTo } of lineRanges) {
    const lineStart = state.doc.line(lineFrom).from + 1;
    const lineEnd = state.doc.line(LineTo).to - 1;
    effects.push(foldEffect.of({ from: lineStart, to: lineEnd }));
  }

  view.dispatch({ effects });
};

export const customFoldGutter = () => {
  return foldService.of(
    (state: EditorState, lineStart: number, lineEnd: number) => {
      try {
        const text = state.doc.sliceString(lineStart, lineEnd);
        const node = syntaxTree(state).resolve(lineEnd);
        if (
          (node.name === 'Body' && text.endsWith('{')) ||
          (node.name === 'Array' && text.endsWith('['))
        ) {
          return {
            from: node.from + 1,
            to: node.to - 1,
          };
        }
      } catch (error) {
        return null;
      }
      return null;
    }
  );
};
