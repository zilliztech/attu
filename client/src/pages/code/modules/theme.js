import { EditorView } from "@codemirror/view";
import { tags } from "@lezer/highlight";
import { syntaxHighlighting, HighlightStyle } from "@codemirror/language";

export const theme = EditorView.theme({
  "&.cm-editor": {
    "&.cm-focused": {
      outline: "none",
    },
  },
  ".cm-content": {
    color: "#484D52",
    fontFamily: "ApercuMonoPro Light",
    fontSize: "13.5px",
  },
  ".cm-line": { padding: " 0 4px 0 15px" },
  "&.cm-focused .cm-content": {
    color: "#484D52",
  },
  ".cm-activeLine": { backgroundColor: "transparent" },
  ".cm-lineNumbers .cm-gutterElement": {
    padding: "0 22px 0 26px",
  },
  // auto completion box style
  ".cm-tooltip.cm-tooltip-autocomplete": {
    border: "none",
    transform: "translateX(-16px)", // adjust box position to align with the text
  },
  ".cm-tooltip.cm-tooltip-autocomplete>ul": {
    fontFamily: "ApercuMonoPro Light",
    maxHeight: "208px",
    border: "1px solid transparent",
    borderRadius: "4px",
    boxShadow: "0 4px 16px rgb(52 56 59 / 13%)",
  },
  ".cm-tooltip.cm-tooltip-autocomplete>ul li": {
    display: "flex",
    flexDirection: "column",
    maxWidth: "400px",
    minWidth: "300px",
    whiteSpace: "normal",
    paddingTop: "6px",
    border: "none",
    borderColor: "#e2e3e5",
    borderBottom: "1px solid transparent",
    paddingBottom: "8px",
    padding: "6px 12px 8px",
    borderLeft: "4px solid transparent",
  },
  ".cm-tooltip-autocomplete .cm-completionLabel": {
    display: "block",
    fontSize: "13.5px",
    fontWeight: "bold",
    order: 1,
  },
  ".cm-tooltip-autocomplete .cm-completionIcon": {
    display: "block",
    fontSize: "13.5px",
    order: 2,
  },
  ".cm-tooltip-autocomplete .cm-completionDetail": {
    display: "block",
    fontSize: "13.5px",
    order: 2,
  },
  ".cm-tooltip-autocomplete>ul>li[aria-selected=true]": {
    backgroundColor: "#fff",
    color: "#484D52",
    borderColor: "#e2e3e5",
    borderLeftColor: "#1a6ce7",
  },
});

export const baseTheme = EditorView.baseTheme({
  "&light .cm-selectionBackground": {
    backgroundColor: "rgb(195,222,252)",
  },
  "&light.cm-focused .cm-selectionBackground": {
    backgroundColor: "rgb(195,222,252)",
  },
  "&light .cm-gutters": {
    backgroundColor: "#fff",
  },
  "&light .cm-activeLineGutter": {
    backgroundColor: "transparent",
    fontWeight: "bold",
  },
});

// sql highlight color
export const highlights = syntaxHighlighting(
  HighlightStyle.define([
    { tag: tags.keyword, color: "#085bd7" },
    { tag: tags.literal, color: "#000"},
    { tag: tags.operator, color: "red"},
    { tag: tags.annotation, color: "blue"},
    { tag: tags.bracket, color: "#333" },
    { tag: tags.number, color: "#0c7e5e" },
    { tag: tags.string, color: "#085bd7" },
    { tag: tags.function, color: "blue" },
    { tag: tags.lineComment, color: "#a2a2a2", fontStyle: "italic" },
    { tag: tags.comment, color: "#a2a2a2", fontStyle: "italic" },
  ])
);
