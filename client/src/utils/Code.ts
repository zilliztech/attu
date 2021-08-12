export const getCreateIndexJSCode = () => {
  const jsCode = `const a = 2;
const testFunction = (input) => {
  console.log(input)
}
testFunction(a)`;

  return jsCode;
};

export const getCreateIndexPYCode = () => {
  const pyCode = `# Python program to find the
# maximum of two numbers
  
def maximum(a, b):
  if a >= b:
      return a
  else:
      return b
      
# Driver code
a = 2
b = 4
print(maximum(a, b))`;

  return pyCode;
};
