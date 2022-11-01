import { syntaxTree } from '@codemirror/language';
import { CompletionContext } from '@codemirror/autocomplete';
import {
  keywords,
  pymilvusKeywords,
  variables,
  snippets,
} from './autocompletion/python';

export function autocomplete(context: CompletionContext) {
  const current = syntaxTree(context.state).resolveInner(context.pos, -1);
  const word = context.matchBefore(/\w*/);
  const token = context.tokenBefore(['VariableName']);

  console.log(current, 'word', word, token);

  if (
    current &&
    current.prevSibling &&
    current.prevSibling.name === 'from'
  ) {
    return {
      from: current.prevSibling.to + 1,
      options: [{ label: 'pymilvus', type: 'milvus' }],
    };
  }

  if (word!.from == word!.to && !context.explicit) return null;
  return {
    from: word!.from,
    options: [...keywords, ...variables, ...pymilvusKeywords, ...snippets],
  };
}
