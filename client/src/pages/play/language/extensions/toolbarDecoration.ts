import { syntaxTree } from '@codemirror/language';
import { RangeSetBuilder } from '@codemirror/state';
import { Rect, ViewPlugin, ViewUpdate, WidgetType } from '@codemirror/view';
import { EditorView, Decoration, DecorationSet } from '@codemirror/view';
import { AxiosError } from 'axios';

import { type PlaygroundExtensionParams, CustomEventNameEnum } from '../../Types';
import { DocumentEventManager, createPlaygroundRequest } from '../../utils';

const apiPlaygroundRequest = createPlaygroundRequest('frontend');

const createElement = (params: Parameters<typeof apiPlaygroundRequest>[0]) => {
  const runButton = document.createElement('button');
  runButton.textContent = 'Run ▶';
  runButton.className = 'run-button';
  runButton.onclick = async () => {
    try {
      DocumentEventManager.dispatch(
        CustomEventNameEnum.PlaygroundResponseDetail,
        { loading: true, response: "running" }
      );
      const res = await apiPlaygroundRequest(params);
      DocumentEventManager.dispatch(
        CustomEventNameEnum.PlaygroundResponseDetail,
        { response: res.data, loading: false }
      );
    } catch (err) {
      DocumentEventManager.dispatch(
        CustomEventNameEnum.PlaygroundResponseDetail,
        { loading: false, error: (err as AxiosError).response?.data ?? { message: (err as Error).message } }
      );
      console.error('Error:', err);
    }
  };

  const toolbar = document.createElement('div');
  toolbar.className = 'playground-toolbar';
  toolbar.appendChild(runButton);
  return toolbar;
};

const getToolbarDecoration = (
  params: Parameters<typeof apiPlaygroundRequest>[0]
) =>
  Decoration.widget({
    widget: {
      toDOM() {
        return createElement(params);
      },
      eq: function (widget: WidgetType): boolean {
        return widget instanceof WidgetType;
      },
      updateDOM: function (dom: HTMLElement, view: EditorView): boolean {
        return true;
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

export const buildToolbarDecorationExtension = (options: PlaygroundExtensionParams) =>
  ViewPlugin.fromClass(
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

          const url = urlNode ? doc.sliceString(urlNode.from, urlNode.to) : '';
          const body = bodyNode
            ? doc.sliceString(bodyNode.from, bodyNode.to)
            : '{}';
          const method = HTTPMethodNode
            ? doc.sliceString(HTTPMethodNode.from, HTTPMethodNode.to)
            : '';
          const bodyObj = JSON.parse(body);
          const host = options.baseUrl;

          const getAuthorization = () => {
            if (options.token) {
              return `Bearer ${options.token}`;
            }
            if (options.username && options.password) {
              return `Bearer ${options.username}:${options.password}`;
            }
            return undefined;
          }

          const params = {
            host,
            url,
            headers: {
              Authorization: getAuthorization(),
            },
            method,
            body: bodyObj,
          };

          const from = requestNode.from;
          // Add run button decoration at the start of the requestNode
          builder.add(from, from, getToolbarDecoration(params));
        }

        return builder.finish();
      }
    },
    {
      decorations: v => v.decorations,
    }
  );
