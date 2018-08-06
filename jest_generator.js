const prettier = require("prettier");

module.exports = {
  generate: (subject_name, tests, subject) =>
    prettier.format(`
    // This test is generated, please don't edit it your changes will be lost.
    describe("${subject_name}", () => {
      const ${subject_name} = ${subject}
      let temp;
    ${tests
      .map(
        test => `it("${test.it}", () => {
      ${test.commands
        .map(c => {
          if (c.type === "input") {
            return "temp = " + c.value;
          }
          if (c.type === "output") {
            return `expect(temp).toBe(${c.value})`;
          }
        })
        .join("\n")}
    });
    `
      )
      .join("\n")}
  })`)
};
