export enum CodeLanguageEnum {
  javascript = 'javascript',
  python = 'python',
  go = 'go',
}

export interface CodeBlockProps {
  code: string;
  language: CodeLanguageEnum;
}
