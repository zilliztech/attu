import { lintGutter, linter, Diagnostic } from '@codemirror/lint';
import { EditorView } from '@codemirror/view';
import { syntaxTree } from '@codemirror/language';

export const milvusHttpLinter = [
  lintGutter(), // Enable the lint gutter to display error indicators
  linter((view: EditorView) => {
    const state = view.state;
    const tree = syntaxTree(state); // Get the syntax tree of the current document

    // Array to store linting diagnostics (errors/warnings)
    const diagnostics: Diagnostic[] = [];

    // Iterate through the syntax tree
    tree.iterate({
      enter(node) {
        // Check if the current node is an error node
        if (node.type.isError) {
          // Get the start and end positions of the error node
          const from = node.from;
          const to = node.to;

          // Add the error to the diagnostics array
          diagnostics.push({
            from,
            to,
            severity: 'error', // Set the severity level (error/warning/info)
            message: 'Syntax error detected', // Error message to display
          });
        }
      },
    });

    // Return the list of diagnostics to be displayed in the editor
    return diagnostics;
  }),
];
