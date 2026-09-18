const camelCase = /^[a-z][a-zA-Z0-9]*$/;

export default {
  meta: { name: "models" },
  rules: {
    "camel-case-keys": {
      meta: {
        type: "suggestion",
        docs: { description: "Require camelCase keys in model files." },
        schema: [],
        messages: {
          invalid: 'Field key "{{name}}" must use camelCase.',
        },
      },
      create(context) {
        function checkKey(node) {
          const key = node.key;
          let name;
          if (!node.computed && key.type === "Identifier") {
            name = key.name;
          } else if (key.type === "Literal") {
            name = String(key.value);
          } else if (key.type === "TemplateLiteral" && key.expressions.length === 0) {
            name = key.quasis[0].value.cooked;
          }

          // Dynamic computed keys cannot be resolved without runtime evaluation.
          if (name != null && !camelCase.test(name)) {
            context.report({ node: key, messageId: "invalid", data: { name } });
          }
        }

        return {
          Property: checkKey,
          PropertyDefinition: checkKey,
          MethodDefinition: checkKey,
          TSPropertySignature: checkKey,
          TSMethodSignature: checkKey,
        };
      },
    },
  },
};
