const parser = require("@babel/parser");
const traverse = require("@babel/traverse");
const generate = require("@babel/generator").default;
const jest_generator = require("./jest_generator.js");
const code = `
  /*
    it adds integers
      > sum(2, 4)
      < 6
    it fails when adding an object
      > sum(2, {})
      < "error"
  */
  function sum(a, b) {
    return a + b
  }
`;

const parseVitalComment = s => s.split("\n").map(s => s.trim());
const reduceLines = (acc, line) => {
  if (line.indexOf("it") === 0) {
    let [_, label] = line.split("it");
    acc.currentLabel = label.trim();
    acc[acc.currentLabel] = [];
  } else if (line.indexOf(">") === 0) {
    let [_, value] = line.split(">");
    acc[acc.currentLabel].push({ type: "input", value: value.trim() });
  } else if (line.indexOf("<") === 0) {
    let [_, value] = line.split("<");
    acc[acc.currentLabel].push({ type: "output", value: value.trim() });
  } else {
    // no-op
  }
  return acc;
};

const extractTests = lines => {
  const prepped = lines.reduce(reduceLines, {});
  delete prepped.currentLabel;
  return Object.keys(prepped).map(k => ({ it: k, commands: prepped[k] }));
};

const ast = parser.parse(code);
const functionBlock = ast.program.body[0];
const commentBlock = functionBlock.leadingComments[0];

const data = parseVitalComment(commentBlock.value);
const tests = extractTests(data);
const subject = generate(functionBlock, { comments: false }, "").code;
const subject_name = functionBlock.id.name;
const jestString = jest_generator.generate(subject_name, tests, subject);

console.log(jestString);
