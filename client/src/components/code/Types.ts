export interface CodeViewProps {
  height?: number;
  wrapperClass?: string;
  data: CodeViewData[];
}

export enum CodeLanguageEnum {
  javascript = 'javascript',
  python = 'python',
}

export interface CodeBlockProps {
  code: string;
  language: CodeLanguageEnum;
  wrapperClass?: string;
}

export interface CodeViewData extends CodeBlockProps {
  label: string;
}
