import {
  autocompletion,
  Completion,
  CompletionContext,
} from '@codemirror/autocomplete';
import { EditorView } from 'codemirror';
import { syntaxTree } from '@codemirror/language';
import { EditorState, Text } from '@codemirror/state';
import { CollectionObject, DatabaseObject } from '@server/types';
import { VersionMap, ObjectMap, IdentifierMapArr } from './consts';

function getContextStack(doc: Text, pos: number, startLine: number = 1) {
  const stack = [];
  let currentLine = doc.lineAt(pos).number;
  let bracesCount = 0;
  let bracketsCount = 0;

  for (let lineNum = currentLine; lineNum >= startLine; lineNum--) {
    const lineText =
      lineNum === currentLine
        ? doc.sliceString(doc.line(lineNum).from, pos)
        : doc.line(lineNum).text;

    for (let i = lineText.length - 1; i >= 0; i--) {
      const char = lineText[i];

      if (char === '}') {
        bracesCount++;
      } else if (char === '{') {
        bracesCount--;
        if (bracesCount < 0) {
          const keyMatch = lineText.match(/"([^"]+)"\s*:\s*\{/);
          if (keyMatch) {
            stack.push(keyMatch[1]);
          }
          bracesCount = 0;
        }
      } else if (char === ']') {
        bracketsCount++;
      } else if (char === '[') {
        bracketsCount--;
        if (bracketsCount < 0) {
          const keyMatch = lineText.match(/"([^"]+)"\s*:\s*\[/);
          if (keyMatch) {
            stack.push(keyMatch[1]);
          }
          bracketsCount = 0;
        }
      }
    }

    if (bracesCount < 0) {
      break;
    }
  }

  return stack;
}

function methodCompletions(context: CompletionContext) {
  const nodeBefore = syntaxTree(context.state).resolve(context.pos, -1);

  if (
    nodeBefore.parent?.name === 'MultipleRequests' ||
    (nodeBefore.parent?.name === 'Request' && nodeBefore.name === 'HTTPMethod')
  ) {
    const word = context.matchBefore(/\w*/);
    if (!word || (word.from === word.to && !context.explicit)) return null;
    return {
      from: word.from,
      options: [
        { label: 'GET', type: 'keyword' },
        { label: 'POST', type: 'keyword' },
        { label: 'PUT', type: 'keyword' },
        { label: 'DELETE', type: 'keyword' },
      ],
    };
  }
  return null;
}

function urlCompletions(context: CompletionContext) {
  const nodeBefore = syntaxTree(context.state).resolve(context.pos, -1);

  if (
    ![
      'Request',
      'URL',
      'API',
      'Aliases',
      'Collections',
      'Databases',
      'Partitions',
      'Jobs',
      'Indexes',
      'ResourceGroups',
      'Roles',
      'Users',
      'Vectors',
    ].includes(nodeBefore.parent?.name ?? '')
  ) {
    return null;
  }

  const word = context.matchBefore(/\w*/);
  const url = context.matchBefore(/[/\w]*/) ?? { text: '' };
  const urlArr = url.text.split('/');

  if (url?.text === '/') {
    const keys = Object.keys(VersionMap);
    return {
      from: word?.from ?? 0,
      options: keys.map(key => ({ label: key, type: 'keyword' })),
    };
  } else if (
    Object.keys(VersionMap).some(item => item === urlArr[urlArr.length - 2])
  ) {
    const keys =
      VersionMap[urlArr[urlArr.length - 2] as keyof typeof VersionMap];
    return {
      from: word?.from ?? 0,
      options: keys.map(key => ({ label: key, type: 'keyword' })),
    };
  } else if (
    Object.keys(ObjectMap).some(item => item === urlArr[urlArr.length - 2])
  ) {
    const keys = ObjectMap[urlArr[urlArr.length - 2] as keyof typeof ObjectMap];
    return {
      from: word?.from ?? 0,
      options: keys.map(key => ({ label: key, type: 'keyword' })),
    };
  } else if (
    IdentifierMapArr.some(item => item.name === urlArr[urlArr.length - 2])
  ) {
    const list =
      IdentifierMapArr.find(item => item.name === urlArr[urlArr.length - 2])
        ?.children ?? [];
    return {
      from: word?.from ?? 0,
      options: list.map(item => ({ label: item.name, type: 'keyword' })),
    };
  }

  return null;
}

function bodyIdentifierCompletions(context: CompletionContext) {
  const state = context.state;
  const doc = state.doc;
  const tree = syntaxTree(state);
  const cursor = state.selection.main.head;

  let nodeAtCursor = tree.resolve(cursor, -1);
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

  if (!requestNode) {
    return null;
  }

  const nodeBefore = syntaxTree(context.state).resolve(context.pos, -1);
  if (nodeBefore.name !== 'Identifier') {
    return null;
  }

  //map properties from body to cursor position
  const bodyNode = requestNode.getChildren('Body')[0];
  const bodyStartLine = doc.lineAt(bodyNode.from).number;
  const properties = getContextStack(
    state.doc,
    context.pos,
    bodyStartLine
  ).reverse();

  const urlNode = requestNode.getChildren('URL')[0];
  const url = urlNode ? doc.sliceString(urlNode.from, urlNode.to) : '';
  const urlArr = url.split('/');
  const objectName = urlArr[urlArr.length - 2];
  const funcName = urlArr[urlArr.length - 1];

  let identifiers =
    IdentifierMapArr.find(item => item.name === objectName)?.children?.find(
      item => item.name === funcName
    )?.children ?? [];

  if (properties.length > 0) {
    for (let i = 0; i < properties.length; i++) {
      const identifier = identifiers.find(item => item.name === properties[i]);
      if (identifier) {
        identifiers = identifier.children ?? [];
      }
    }
  }

  const word = context.matchBefore(/\w*/);
  return {
    from: word?.from ?? 0,
    options: identifiers.map(item => ({ label: item.name, type: 'keyword' })),
  };
}

function getBodyValueCompletions(options: {
  databases: DatabaseObject[];
  collections: CollectionObject[];
}) {
  return (context: CompletionContext) => {
    const { databases, collections } = options;
    const nodeBefore = syntaxTree(context.state).resolve(context.pos, -1);
    const line = context.matchBefore(/.*/) ?? { text: '' };
    const identifier = line.text.match(/"([^"]+)"\s*:\s*/)?.[1];

    if (!identifier || nodeBefore.parent?.name !== 'Value') {
      return null;
    }

    const word = context.matchBefore(/\w*/);

    if (identifier === 'dbName') {
      return {
        from: word?.from ?? 0,
        options: databases.map(db => ({ label: db.db_name, type: 'keyword' })),
      };
    }

    if (identifier === 'collectionName') {
      return {
        from: word?.from ?? 0,
        options: collections.map(col => ({
          label: col.collection_name,
          type: 'keyword',
        })),
      };
    }

    return null;
  };
}

function addTabBadge() {
  return {
    render: (completion: Completion, state: EditorState, view: EditorView) => {
      const span = document.createElement('span');
      span.className = 'cm-autocomplete-option-tab-badge';
      span.textContent = 'tab';
      return span;
    },
    position: 100,
  };
}

export function Autocomplete(options: {
  databases: DatabaseObject[];
  collections: CollectionObject[];
}) {
  return autocompletion({
    override: [
      methodCompletions,
      urlCompletions,
      bodyIdentifierCompletions,
      getBodyValueCompletions(options),
    ],
    addToOptions: [addTabBadge()],
    icons: false,
  });
}
