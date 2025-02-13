import { syntaxHighlighting, HighlightStyle } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';

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
