import { syntaxTree } from "@codemirror/language";
const completePropertyAfter = ["VERB", ".", "?."];
const dontCompleteIn = [
  "TemplateString",
  "LineComment",
  "BlockComment",
  "VariableDefinition",
  "PropertyDefinition",
];

export function autocomplete(context) {
  let nodeBefore = syntaxTree(context.state).resolveInner(context.pos, -1);

  console.log(nodeBefore.parent && nodeBefore.parent.getChildren("Keyword"));

  if (
    completePropertyAfter.includes(nodeBefore.name) &&
    nodeBefore.parent?.name == "MemberExpression"
  ) {
    let object = nodeBefore.parent.getChild("Expression");
    if (object?.name == "VariableName") {
      let from = /\./.test(nodeBefore.name) ? nodeBefore.to : nodeBefore.from;
      let variableName = context.state.sliceDoc(object.from, object.to);
      if (typeof window[variableName] == "object")
        return completeProperties(from, window[variableName]);
    }
  } else if (nodeBefore.name == "VariableName") {
    return completeProperties(nodeBefore.from, window);
  } else if (context.explicit && !dontCompleteIn.includes(nodeBefore.name)) {
    return completeProperties(context.pos, window);
  }
  return null;
}

function completeProperties(from, object) {
  let options = [];
  for (let name in object) {
    options.push({
      label: name,
      type: typeof object[name] == "function" ? "function" : "variable",
    });
  }
  return {
    from,
    options,
    validFor: /^[\w$]*$/,
  };
}
