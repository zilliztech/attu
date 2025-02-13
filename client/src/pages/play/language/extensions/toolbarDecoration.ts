import { syntaxTree } from '@codemirror/language';
import { RangeSetBuilder } from '@codemirror/state';
import { Rect, ViewPlugin, ViewUpdate, WidgetType } from '@codemirror/view';
import { EditorView, Decoration, DecorationSet } from '@codemirror/view';
import axios from 'axios';

const runButton = document.createElement('button');
runButton.textContent = 'Run ▶';
runButton.className = 'run-button';

const toolbar = document.createElement('div');
toolbar.className = 'playground-toolbar';
toolbar.appendChild(runButton);

const toolbarDecoration = Decoration.widget({
  widget: {
    toDOM() {
      return toolbar;
    },
    eq: function (widget: WidgetType): boolean {
      return widget instanceof WidgetType;
    },
    updateDOM: function (dom: HTMLElement, view: EditorView): boolean {
      return false;
    },
    estimatedHeight: 0,
    lineBreaks: 0,
    ignoreEvent: function (event: Event): boolean {
      return false;
    },
    coordsAt: function (
      dom: HTMLElement,
      pos: number,
      side: number
    ): Rect | null {
      return null;
    },
    compare: function (widget: WidgetType): boolean {
      return this.eq(widget);
    },
    destroy: function (dom: HTMLElement): void {
      const button = dom as HTMLButtonElement;
      button.onclick = null;
    },
  } as WidgetType,
});

export const toolbarDecorationExtension = ViewPlugin.fromClass(
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
        const urlNode = requestNode.getChildren('URL')[0];
        const bodyNode = requestNode.getChildren('Body')[0];
        const HTTPMethodNode = requestNode.getChildren('HTTPMethod')[0];

        const from = requestNode.from;

        // Add run button decoration at the start of the requestNode
        builder.add(from, from, toolbarDecoration);

        // Attach click event to the button
        const button = document.body.querySelector(
          '.run-button'
        ) as HTMLButtonElement;
        if (button) {
          button.onclick = async () => {
            const url = urlNode
              ? doc.sliceString(urlNode.from, urlNode.to)
              : '';
            const body = bodyNode
              ? doc.sliceString(bodyNode.from, bodyNode.to)
              : '{}';
            const method = HTTPMethodNode
              ? doc.sliceString(HTTPMethodNode.from, HTTPMethodNode.to)
              : '';

            try {
              const bodyObj = JSON.parse(body);
              const res = await axios.post('/api/v1/playground', {
                url,
                method,
                body: bodyObj,
              });
              console.log('Success:', res);
            } catch (err) {
              console.error('Error:', err);
            }
          };
        }
      }

      return builder.finish();
    }
  },
  {
    decorations: v => v.decorations,
  }
);
