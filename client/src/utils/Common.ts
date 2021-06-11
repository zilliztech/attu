export const copyToCommand = (
  value: string,
  classSelector?: string,
  cb?: () => void
) => {
  const element = classSelector
    ? document.querySelector(`.${classSelector}`)
    : document.body;
  const input = document.createElement('textarea');
  input.value = value;
  element?.appendChild(input);
  input.select();

  if (document.execCommand('copy')) {
    document.execCommand('copy');
    cb && cb();
  }
  element?.removeChild(input);
};

export const generateId = (prefix = 'id') =>
  `${prefix}_${Math.random().toString(36).substr(2, 16)}`;

export const formatNumber = (number: number): string => {
  return new Intl.NumberFormat().format(number);
};

/**
 * Only use in dev env
 * Parent component props is optional but required in child component. Need throw some error
 * @param text
 */
export const throwErrorForDev = (text: string) => {
  throw new Error(text);
};
