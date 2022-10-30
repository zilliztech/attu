import { syntaxTree } from '@codemirror/language';
import { CompletionContext } from '@codemirror/autocomplete';
import {
  keywords,
  pymilvusKeywords,
  variables,
  pymilvusObjectKeyMap,
  snippets,
} from './autocompletion/python';

const objectKeys = Object.keys(pymilvusObjectKeyMap);

export function autocomplete(context: CompletionContext) {
  const nodeBefore = syntaxTree(context.state).resolveInner(context.pos, -1);
  const word = context.matchBefore(/\w*/);
  const token = context.tokenBefore(['VariableName']);

  console.log(nodeBefore, 'word', word, token);

  if (
    nodeBefore &&
    nodeBefore.prevSibling &&
    nodeBefore.prevSibling.name === 'from'
  ) {
    return {
      from: nodeBefore.prevSibling.to + 1,
      options: [{ label: 'pymilvus', type: 'milvus' }],
    };
  }

  if (
    nodeBefore &&
    nodeBefore.name === 'VariableName' &&
    word &&
    word.from > 0
  ) {
    return {
      from: word!.from,
      options: [...variables, ...pymilvusKeywords, ...snippets],
    };
  }

  if (nodeBefore.name === '.' || nodeBefore.name === 'PropertyName') {
    const previousNode = nodeBefore!.prevSibling;
    const textBefore = context.state.sliceDoc(
      previousNode!.from,
      context.pos - 1
    );

    console.log(nodeBefore, previousNode, 'textBefore', textBefore);

    if (objectKeys.indexOf(textBefore) != -1) {
      return {
        from: word!.from,
        options: [...pymilvusObjectKeyMap[textBefore]],
      };
    }
  }

  if (word!.from == word!.to && !context.explicit) return null;
  return {
    from: word!.from,
    options: [...keywords, ...variables, ...pymilvusKeywords, ...snippets],
  };
}
