export interface CodeViewProps {
  height?: number;
  wrapperClass?: string;
  data: CodeViewData[];
}

export enum CodeLanguageEnum {
  javascript = 'javascript',
  python = 'python',
  java = 'java',
  go = 'go',
}

export interface CodeBlockProps {
  code: string;
  language: string;
  wrapperClass?: string;
}

export interface CodeViewData extends CodeBlockProps {
  label: string;
}
