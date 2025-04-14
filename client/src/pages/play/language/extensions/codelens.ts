import { syntaxTree } from '@codemirror/language';
import { Range, Text } from '@codemirror/state';
import { ViewPlugin, ViewUpdate, WidgetType } from '@codemirror/view';
import { EditorView, Decoration, DecorationSet } from '@codemirror/view';
import { AxiosError } from 'axios';
import { MILVUS_RESTFUL_DOC_URL, CLOUD_RESTFUL_DOC_URL } from '@/consts';
import { CustomEventNameEnum, PlaygroundExtensionParams } from '../../Types';
import { playgroundRequest, DocumentEventManager } from '../../utils';

class CodeLensWidget extends WidgetType {
  constructor(
    readonly options: {
      readonly line: number;
      readonly onRunClick: () => void;
      readonly onDocsClick: () => void;
    }
  ) {
    super();
  }

  toDOM(view: EditorView): HTMLElement {
    const container = document.createElement('div');
    container.className = 'playground-codelens';

    const runBtn = document.createElement('div');
    runBtn.className = 'codelens-item run-button';
    runBtn.textContent = 'RUN';
    runBtn.title = `⌘ + ⇧ + ↵`;
    runBtn.onclick = this.options.onRunClick;

    const docsBtn = document.createElement('a');
    docsBtn.className = 'codelens-item docs-button';
    docsBtn.textContent = 'DOCS';
    docsBtn.title = `⌘ + H`;
    docsBtn.onclick = this.options.onDocsClick;

    container.appendChild(runBtn);
    container.appendChild(docsBtn);
    return container;
  }
}

const getRequestParams = (
  requestNode: ReturnType<ReturnType<typeof syntaxTree>['resolve']>,
  doc: Text,
  options: PlaygroundExtensionParams
) => {
  const urlNode = requestNode.getChildren('URL')[0];
  const bodyNode = requestNode.getChildren('Body')[0];
  const HTTPMethodNode = requestNode.getChildren('HTTPMethod')[0];

  const url = urlNode ? doc.sliceString(urlNode.from, urlNode.to) : '';
  const body = bodyNode ? doc.sliceString(bodyNode.from, bodyNode.to) : '{}';
  const method = HTTPMethodNode
    ? doc.sliceString(HTTPMethodNode.from, HTTPMethodNode.to)
    : '';
  let bodyObj: object = {};
  try {
    bodyObj = JSON.parse(body);
  } catch (err) {
    console.error('Failed to parse body: ', (err as Error).message);
  }
  const host = options.baseUrl;

  const getAuthorization = () => {
    if (options.token) {
      return `Bearer ${options.token}`;
    }
    if (options.username && options.password) {
      return `Bearer ${options.username}:${options.password}`;
    }
    return undefined;
  };

  return {
    host,
    url,
    headers: {
      Authorization: getAuthorization(),
    },
    method,
    body: bodyObj,
  };
};

export const codeLensDecoration = (options: PlaygroundExtensionParams) =>
  ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;

      constructor(view: EditorView) {
        this.decorations = this.updateDecorations(view);
      }

      update(update: ViewUpdate) {
        if (update.docChanged || update.viewportChanged) {
          this.decorations = this.updateDecorations(update.view);
        }
      }

      updateDecorations(view: EditorView): DecorationSet {
        const widgets: Range<Decoration>[] = [];
        const tree = syntaxTree(view.state);
        const state = view.state;
        const doc = state.doc;

        let token = '';
        // Find the Authorization node at the root level
        tree.iterate({
          enter: node => {
            if (node.name === 'Authorization') {
              const authorizationNode = node.node;
              const tokenNode =
                authorizationNode.getChildren('UnquotedString')[0];
              token = tokenNode
                ? doc.sliceString(tokenNode.from, tokenNode.to)
                : '';
              return false;
            }
          },
        });

        tree.iterate({
          enter: node => {
            if (node.type.name === 'Request' || node.name === 'Request') {
              const line = view.state.doc.lineAt(node.from).number - 1;

              const requestNode = node.node;
              if (token) {
                options.token = token;
              }
              const params = getRequestParams(requestNode, doc, options);

              const onRunClick = async () => {
                try {
                  DocumentEventManager.dispatch(
                    CustomEventNameEnum.PlaygroundResponseDetail,
                    { loading: true, response: 'running' }
                  );

                  const res = await playgroundRequest(params);

                  DocumentEventManager.dispatch(
                    CustomEventNameEnum.PlaygroundResponseDetail,
                    { response: res.data, loading: false }
                  );

                  // if param body contains collectionName, dispatch PlaygroundCollectionUpdate event
                  if ('collectionName' in params.body) {
                    DocumentEventManager.dispatch(
                      CustomEventNameEnum.PlaygroundCollectionUpdate,
                      { collectionName: params.body.collectionName as string }
                    );
                  }
                } catch (err) {
                  DocumentEventManager.dispatch(
                    CustomEventNameEnum.PlaygroundResponseDetail,
                    {
                      loading: false,
                      error: (err as AxiosError).response?.data ?? {
                        message: (err as Error).message,
                      },
                    }
                  );
                  console.error('Error:', err);
                }
              };

              const onDocsClick = () => {
                const { isManaged } = options;
                window.open(
                  isManaged ? CLOUD_RESTFUL_DOC_URL : MILVUS_RESTFUL_DOC_URL,
                  '_blank'
                );
              };

              const widget = Decoration.widget({
                widget: new CodeLensWidget({ line, onRunClick, onDocsClick }),
                side: -1,
              });

              widgets.push(widget.range(view.state.doc.line(line + 1).from));
            }
          },
        });

        return Decoration.set(widgets);
      }
    },
    {
      decorations: v => v.decorations,
    }
  );
