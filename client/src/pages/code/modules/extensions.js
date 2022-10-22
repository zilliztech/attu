import {
  lineNumbers,
  highlightActiveLineGutter,
  highlightSpecialChars,
  drawSelection,
  dropCursor,
  rectangularSelection,
  crosshairCursor,
  highlightActiveLine,
  keymap,
} from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import {
  foldGutter,
  indentOnInput,
  syntaxHighlighting,
  HighlightStyle,
  defaultHighlightStyle,
  bracketMatching,
  foldKeymap,
  indentUnit,
} from '@codemirror/language';
import {
  history,
  defaultKeymap,
  historyKeymap,
  insertTab,
} from '@codemirror/commands';
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search';
import {
  closeBrackets,
  autocompletion,
  closeBracketsKeymap,
  completionKeymap,
  acceptCompletion,
} from '@codemirror/autocomplete';
import { lintKeymap } from '@codemirror/lint';
import { tags } from '@lezer/highlight';

const basicSetup = /*@__PURE__*/ (() => [
  lineNumbers(),
  highlightActiveLineGutter(),
  highlightSpecialChars(),
  history(),
  foldGutter(),
  drawSelection(),
  dropCursor(),
  EditorState.allowMultipleSelections.of(true),
  indentOnInput(),
  syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
  bracketMatching(),
  closeBrackets(),
  autocompletion({
    closeOnBlur: false,
  }),
  rectangularSelection(),
  crosshairCursor(),
  highlightActiveLine(),
  highlightSelectionMatches(),
  keymap.of([
    ...closeBracketsKeymap,
    ...defaultKeymap,
    ...searchKeymap,
    ...historyKeymap,
    ...foldKeymap,
    ...completionKeymap,
    ...lintKeymap,
  ]),
  indentUnit.of('    '), // fix tab indentation
])();

const TabKeyBindings = keymap.of([
  { key: 'Tab', run: acceptCompletion },
  { key: 'Tab', run: insertTab },
]);

// sql highlight color
const sqlSyntaxHighlight = syntaxHighlighting(
  HighlightStyle.define([
    { tag: tags.keyword, color: '#085bd7' },
    { tag: tags.bracket, color: '#333' },
    { tag: tags.number, color: '#0c7e5e' },
    { tag: tags.string, color: '#bf0822' },
    { tag: tags.function, color: 'blue' },
    { tag: tags.lineComment, color: '#a2a2a2', fontStyle: 'italic' },
    { tag: tags.comment, color: '#a2a2a2', fontStyle: 'italic' },
  ])
);

export { basicSetup, TabKeyBindings, sqlSyntaxHighlight };
