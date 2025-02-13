import { parser } from './milvus.http.parser';
// import { foldNodeProp, foldInside, indentNodeProp } from "@codemirror/language";
import { styleTags, tags as t } from '@lezer/highlight';
import { syntaxHighlighting, HighlightStyle } from '@codemirror/language';
import { LRLanguage } from '@codemirror/language';
import { LanguageSupport } from '@codemirror/language';
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

// highlight color
export const highlights = syntaxHighlighting(
  HighlightStyle.define([
    { tag: t.keyword, color: '#085bd7' },
    { tag: t.operator, color: 'red' },
    { tag: t.annotation, color: 'blue' },
    { tag: t.number, color: '#0c7e5e' },
    { tag: t.string, color: '#085bd7' },
    { tag: t.url, color: '#000' },
    // { tag: t.function, color: "blue" },
    { tag: t.lineComment, color: '#a2a2a2', fontStyle: 'italic' },
    { tag: t.comment, color: '#a2a2a2', fontStyle: 'italic' },
  ])
);

export const restLanguage = LRLanguage.define({
  parser: parserWithMetadata,
  languageData: {
    commentTokens: { line: ';' },
  },
});

// export const restCompletion = restLanguage.data.of({
//   autocomplete,
// });

export function MilvusHTTPAPI() {
  return new LanguageSupport(restLanguage, []);
}
