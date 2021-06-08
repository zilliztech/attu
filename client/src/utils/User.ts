export const getEmailAndCode = (search: string): { [key: string]: string } => {
  const s = search.slice(1);
  const result: { [key: string]: string } = {};
  s.split('&').forEach(item => {
    const [key, value] = item.split('=');
    result[key] = value;
  });

  return result;
};
