import { keymap } from '@codemirror/view';
import { indentWithTab } from '@codemirror/commands';
import { acceptCompletion } from '@codemirror/autocomplete';

export function KeyMap() {
  return keymap.of([{ key: 'Tab', run: acceptCompletion }, indentWithTab]);
}
