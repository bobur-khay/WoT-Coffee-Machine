module.exports = {
  env: { es2022: true, browser: true, node: true },
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "unused-imports"],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  rules: {
    // use TS-aware unused-vars and disable base rule
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["error", {
      argsIgnorePattern: "^_",
      varsIgnorePattern: "^_",
      caughtErrorsIgnorePattern: "^_"
    }],

    // imports (auto-fix removes them)
    "unused-imports/no-unused-imports": "error"
  }
};
