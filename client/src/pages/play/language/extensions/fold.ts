import { foldService, syntaxTree } from '@codemirror/language';
import { EditorState } from '@codemirror/state';

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
