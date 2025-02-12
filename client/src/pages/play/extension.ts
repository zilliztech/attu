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
      const doc = state.doc;
      const tree = syntaxTree(state);
      const cursor = state.selection.main.head;

      let nodeAtCursor = tree.resolve(cursor, -1);

      const builder = new RangeSetBuilder<Decoration>();

      let requestNode = null;

      while (nodeAtCursor) {
        if (nodeAtCursor.name === 'Request') {
          requestNode = nodeAtCursor;
          break;
        }
        if (!nodeAtCursor.parent) {
          break;
        }
        nodeAtCursor = nodeAtCursor.parent;
      }

      if (requestNode) {
        // get URL and Body nodes
        const urlNode = requestNode.getChildren('URL')[0];
        const bodyNode = requestNode.getChildren('Body')[0];
        const HTTPMethodNode = requestNode.getChildren('HTTPMethod')[0];

        console.log(
          HTTPMethodNode &&
            doc.sliceString(HTTPMethodNode.from, HTTPMethodNode.to)
        );
        console.log(urlNode && doc.sliceString(urlNode.from, urlNode.to));
        console.log(bodyNode && doc.sliceString(bodyNode.from, bodyNode.to));

        // get from and to positions of the request node
        const from = requestNode.from;
        const to = requestNode.to;

        // highlight the whole request node
        const lines = this.getLinesInRange(doc, from, to);
        lines.forEach(line => {
          builder.add(line.from, line.from, requestHighlightLineDecoration);
        });
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
