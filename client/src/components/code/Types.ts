export interface CodeViewProps {
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
}

export interface CodeViewData extends CodeBlockProps {
  label: string;
}
