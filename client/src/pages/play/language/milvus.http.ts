import { styleTags, tags as t } from '@lezer/highlight';
import { LRLanguage } from '@codemirror/language';
import { LanguageSupport } from '@codemirror/language';

import { parser } from './milvus.http.parser';
import {
  selectionDecoration,
  highlightTokens,
} from './extensions/selectionDecoration';
import { highlights } from './extensions/highlights';
import { milvusHttpLinter } from './extensions/linter';
import { codeLensDecoration } from './extensions/codelens';

import { PlaygroundExtensionParams } from '../Types';

const parserWithMetadata = parser.configure({
  props: [
    styleTags({
      API: t.url,
      HTTPMethod: t.annotation,
      VERSION: t.annotation,
      Identifier: t.keyword,
      Query: t.string,
      LineComment: t.comment,
      Number: t.number,
    }),
  ],
});

export const milvusHttp = LRLanguage.define({
  parser: parserWithMetadata,
  languageData: {
    commentTokens: { line: ';' },
  },
});

export function MilvusHTTP(params: PlaygroundExtensionParams) {
  const { isDarkMode, ...restParams } = params;
  return new LanguageSupport(milvusHttp, [
    highlights(isDarkMode),
    selectionDecoration,
    highlightTokens,
    milvusHttpLinter,
    codeLensDecoration(restParams),
  ]);
}
