import { styleTags, tags as t } from '@lezer/highlight';
import { LRLanguage } from '@codemirror/language';
import { LanguageSupport } from '@codemirror/language';

import { parser } from './milvus.http.parser';
import {
  selectionDecoration,
  highlightTokens,
} from './extensions/selectionDecoration';
import { buildToolbarDecorationExtension } from './extensions/toolbarDecoration';
import { highlights } from './extensions/highlights';
import { milvusHttpLinter } from './extensions/linter';
// import { tabCompletion } from './extensions/autocompletion';

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
  return new LanguageSupport(milvusHttp, [
    highlights,
    selectionDecoration,
    highlightTokens,
    milvusHttpLinter,
    // tabCompletion,
    buildToolbarDecorationExtension(params),
  ]);
}
