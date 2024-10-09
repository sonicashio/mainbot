import stylistic from "@stylistic/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import unjs from "eslint-config-unjs";

export default unjs(
    {
        files: ["**/*.ts", "**/*.js"],
        rules: {
            "@stylistic/max-len": ["error", {
                "code": 140,
                "ignoreComments": true,
                "ignoreStrings": true,
            }],
        },
    },
    {
        languageOptions: {
            parser: typescriptParser,
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
                warnOnUnsupportedTypeScriptVersion: false,
            },
        },
        files: ["**/*.ts", "**/*.js"],
        rules: {
            "@typescript-eslint/explicit-function-return-type": "error",
            "@typescript-eslint/no-floating-promises": "error",
        },
    },
    stylistic.configs.customize({
        ...stylistic.configs["recommended-flat"],
        ...stylistic.configs["recommended-extends"],
        indent: 4,
        quotes: "double",
        semi: true,
        braceStyle: "1tbs",
        quoteProps: "consistent",
    }),
);
