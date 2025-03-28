import {
  foldEffect,
  unfoldEffect,
  foldService,
  syntaxTree,
  foldState,
} from '@codemirror/language';
import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { ATTU_PLAY_FOLD_STATE } from '@/consts';

export const foldByLineRanges = (
  view: EditorView,
  lineRanges: Array<{ lineFrom: number; lineTo: number }>
) => {
  const effects = [];
  const { state } = view;

  for (const { lineFrom, lineTo } of lineRanges) {
    const lineStart = state.doc.line(lineFrom).from + 1;
    const lineEnd = state.doc.line(lineTo).to - 1;
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

export const persistFoldState = () => {
  return EditorView.updateListener.of(update => {
    if (update.docChanged) {
      // Handle document changes
      const view = update.view;
      const folded = view.state.field(foldState);
      const lineRanges: Array<{ from: number; to: number }> = [];
      folded.between(0, view.state.doc.length, (from, to) => {
        lineRanges.push({ from, to });
      });
      localStorage.setItem(ATTU_PLAY_FOLD_STATE, JSON.stringify(lineRanges));
    } else {
      // Handle fold/unfold effects
      for (const tr of update.transactions) {
        for (const effect of tr.effects) {
          if (effect.is(foldEffect) || effect.is(unfoldEffect)) {
            const view = update.view;
            const folded = view.state.field(foldState);
            const lineRanges: Array<{ from: number; to: number }> = [];
            folded.between(0, view.state.doc.length, (from, to) => {
              lineRanges.push({ from, to });
            });
            localStorage.setItem(
              ATTU_PLAY_FOLD_STATE,
              JSON.stringify(lineRanges)
            );
          }
        }
      }
    }
  });
};

export const loadFoldState = () => {
  try {
    const lineRanges = localStorage.getItem(ATTU_PLAY_FOLD_STATE);
    if (lineRanges) {
      return JSON.parse(lineRanges) as Array<{ from: number; to: number }>;
    }
    return null;
  } catch (err) {
    console.error(err);
  }
};

export const recoveryFoldState = (view: EditorView) => {
  const foldState = loadFoldState();
  if (foldState) {
    try {
      view.dispatch({
        effects: foldState.map(item => foldEffect.of(item)),
      });
    } catch (err) {
      console.error(err);
    }
  }
};
