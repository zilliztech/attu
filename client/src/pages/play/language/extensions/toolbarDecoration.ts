import { syntaxTree } from '@codemirror/language';
import { RangeSetBuilder } from '@codemirror/state';
import { Rect, ViewPlugin, ViewUpdate, WidgetType } from '@codemirror/view';
import { EditorView, Decoration, DecorationSet } from '@codemirror/view';
import { AxiosError } from 'axios';
import { EVENT_PLAYGROUND_RESPONSE } from '@/consts';
import { createPlaygroundRequest } from '@/utils/Playground';

const apiPlaygroundRequest = createPlaygroundRequest('frontend');

const createElement = () => {
  const runButton = document.createElement('button');
  runButton.textContent = 'Run ▶';
  runButton.className = 'run-button';

  const toolbar = document.createElement('div');
  toolbar.className = 'playground-toolbar';
  toolbar.appendChild(runButton);
  return toolbar;
};

const toolbarDecoration = Decoration.widget({
  widget: {
    toDOM() {
      return createElement();
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
            try {
              document.dispatchEvent(
                new CustomEvent(EVENT_PLAYGROUND_RESPONSE, {
                  detail: { loading: true },
                })
              );
              const url = urlNode
                ? doc.sliceString(urlNode.from, urlNode.to)
                : '';
              const body = bodyNode
                ? doc.sliceString(bodyNode.from, bodyNode.to)
                : '{}';
              const method = HTTPMethodNode
                ? doc.sliceString(HTTPMethodNode.from, HTTPMethodNode.to)
                : '';
              const bodyObj = JSON.parse(body);
              const host =
                document
                  .querySelector('div[data-playground-host]')
                  ?.getAttribute('data-playground-host') ?? '';

              const res = await apiPlaygroundRequest({
                host,
                url,
                method,
                body: bodyObj,
              });

              document.dispatchEvent(
                new CustomEvent(EVENT_PLAYGROUND_RESPONSE, {
                  detail: { response: res.data, loading: false },
                })
              );
            } catch (err) {
              document.dispatchEvent(
                new CustomEvent(EVENT_PLAYGROUND_RESPONSE, {
                  detail: {
                    loading: false,
                    error: (err as AxiosError).response?.data ?? {
                      message: (err as Error).message,
                    },
                  },
                })
              );
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
