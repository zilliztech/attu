import { syntaxTree } from '@codemirror/language';
import { RangeSetBuilder } from '@codemirror/state';
import { ViewPlugin, ViewUpdate } from '@codemirror/view';
import { EditorView, Decoration, DecorationSet } from '@codemirror/view';

const requestHighlightLineDecoration = Decoration.line({
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

          const lines = this.getLinesInRange(view.state.doc, from, to);

          lines.forEach(line => {
            builder.add(line.from, line.from, requestHighlightLineDecoration);
          });

          break;
        }

        if (!nodeAtCursor.parent) {
          break;
        }

        nodeAtCursor = nodeAtCursor.parent;
      }

      return builder.finish();
    }

    getLinesInRange(doc: any, from: any, to: any) {
      const lines = [];
      let startLine = doc.lineAt(from);
      let endLine = doc.lineAt(to);

      for (let i = startLine.number; i <= endLine.number; i++) {
        const line = doc.line(i);
        lines.push(line);
      }

      return lines;
    }
  },
  {
    decorations: v => v.decorations,
  }
);
