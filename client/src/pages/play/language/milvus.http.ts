import { parser } from './milvus.http.parser';
import { styleTags, tags as t } from '@lezer/highlight';
import { LRLanguage } from '@codemirror/language';
import { LanguageSupport } from '@codemirror/language';
import { selectionDecoration } from './extensions/selectionDecoration';
import { toolbarDecorationExtension } from './extensions/toolbarDecoration';
import { highlights } from './extensions/highlights';
import { milvusHttpLinter } from './extensions/linter';
// import { autocomplete } from "./completion";

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

// export const restCompletion = restLanguage.data.of({
//   autocomplete,
// });

export function MilvusHTTP() {
  return new LanguageSupport(milvusHttp, [
    highlights,
    selectionDecoration,
    milvusHttpLinter,
    toolbarDecorationExtension,
  ]);
}
