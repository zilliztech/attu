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
  style?: Record<string, React.CSSProperties>;
}
