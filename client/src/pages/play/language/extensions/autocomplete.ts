import { autocompletion, CompletionContext } from '@codemirror/autocomplete';
import { syntaxTree } from '@codemirror/language';

const versionMap = {
  v2: ['vectordb'],
};

const objectMap = {
  vectordb: [
    'aliases',
    'databases',
    'collections',
    'partitions',
    'jobs',
    'indexes',
    'resource_groups',
    'roles',
    'users',
    'entities',
  ],
};

const functionMap = {
  aliases: ['alter', 'create', 'describe', 'drop', 'list'],
  databases: ['alter', 'create', 'describe', 'drop_properties', 'drop', 'list'],
  collections: [
    'fields/alter_properties',
    'alter_properties',
    'compact',
    'create',
    'describe',
    'drop_properties',
    'drop',
    'flush',
    'get_load_state',
    'get_stats',
    'has',
    'list',
    'load',
    'release',
    'rename',
    'refresh_load',
  ],
  partitions: ['create', 'drop', 'get_stats', 'has', 'list', 'load', 'release'],
  jobs: ['import/create', 'import/describe', 'import/list'],
  indexes: [
    'alter_properties',
    'create',
    'describe',
    'drop_properties',
    'drop',
    'list',
  ],
  resource_groups: [
    'create',
    'describe',
    'drop',
    'list',
    'transfer_replica',
    'alter',
  ],
  roles: [
    'create',
    'describe',
    'drop',
    'grant_privilege',
    'list',
    'revoke_privilege',
  ],
  users: [
    'create',
    'describe',
    'drop',
    'grant_role',
    'list',
    'revoke_role',
    'update_password',
  ],
  entities: [
    'delete',
    'get',
    'hybrid_search',
    'insert',
    'query',
    'search',
    'upsert',
  ],
};

function methodCompletions(context: CompletionContext) {
  const nodeBefore = syntaxTree(context.state).resolve(context.pos, -1);
  if (nodeBefore.name === 'Body') {
    return null;
  }
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

function urlCompletions(context: CompletionContext) {
  const nodeBefore = syntaxTree(context.state).resolve(context.pos, -1);
  if (nodeBefore.name === 'Body') {
    return null;
  }

  const word = context.matchBefore(/\w*/);
  const url = context.matchBefore(/[/\w]*/) ?? { text: '' };
  const urlArr = url.text.split('/');

  if (url?.text === '/') {
    const keys = Object.keys(versionMap);
    return {
      from: word?.from ?? 0,
      options: keys.map(key => ({ label: key, type: 'keyword' })),
    };
  } else if (
    Object.keys(versionMap).some(item => item === urlArr[urlArr.length - 2])
  ) {
    const keys =
      versionMap[urlArr[urlArr.length - 2] as keyof typeof versionMap];
    return {
      from: word?.from ?? 0,
      options: keys.map(key => ({ label: key, type: 'keyword' })),
    };
  } else if (
    Object.keys(objectMap).some(item => item === urlArr[urlArr.length - 2])
  ) {
    const keys = objectMap[urlArr[urlArr.length - 2] as keyof typeof objectMap];
    return {
      from: word?.from ?? 0,
      options: keys.map(key => ({ label: key, type: 'keyword' })),
    };
  } else if (
    Object.keys(functionMap).some(item => item === urlArr[urlArr.length - 2])
  ) {
    const keys =
      functionMap[urlArr[urlArr.length - 2] as keyof typeof functionMap];
    return {
      from: word?.from ?? 0,
      options: keys.map(key => ({ label: key, type: 'keyword' })),
    };
  }

  return null;
}

export function Autocomplete() {
  return autocompletion({
    override: [methodCompletions, urlCompletions],
  });
}
