import { syntaxTree } from '@codemirror/language';
import { RangeSetBuilder } from '@codemirror/state';
import { ViewPlugin, ViewUpdate } from '@codemirror/view';
import { EditorView, Decoration, DecorationSet } from '@codemirror/view';

const requestHighlightDecoration = Decoration.mark({
  class: 'cm-request-highlight',
});

export const httpSelectionPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = this.computeDecorations(view);
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.selectionSet) {
        this.decorations = this.computeDecorations(update.view);
      }
    }

    computeDecorations(view: EditorView) {
      const state = view.state;
      const tree = syntaxTree(state);
      const cursor = state.selection.main.head;

      let nodeAtCursor = tree.resolve(cursor, -1);
      const builder = new RangeSetBuilder<Decoration>();

      while (nodeAtCursor) {
        if (nodeAtCursor.name === 'Request') {
          const from = nodeAtCursor.from;
          const to = nodeAtCursor.to;

          builder.add(from, to, requestHighlightDecoration);
          break;
        }

        if (!nodeAtCursor.parent) {
          break;
        }

        nodeAtCursor = nodeAtCursor.parent;
      }

      return builder.finish();
    }
  },
  {
    decorations: v => v.decorations,
  }
);
