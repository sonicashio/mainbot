// import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintPluginVue from "eslint-plugin-vue";
import stylistic from "@stylistic/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";

export default tseslint.config(
    // eslint.configs.recommended,
    ...tseslint.configs.recommended,
    ...eslintPluginVue.configs["flat/recommended"],
    stylistic.configs["recommended-flat"],
    stylistic.configs.customize({
        indent: 4,
        quotes: "double",
        semi: true,
        braceStyle: "1tbs",
        quoteProps: "consistent",
    }),
    {
        files: ["**/*.ts", "**/*.js", "**/*.vue"],
        rules: {
            "@stylistic/max-len": ["error", {
                "code": 140,
                "ignoreComments": true,
                "ignoreStrings": true,
            }],
        },
    },
    {
        files: ["**/*.ts", "**/*.js"],
        languageOptions: {
            parser: typescriptParser,
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
                warnOnUnsupportedTypeScriptVersion: false,
            },
        },
        rules: {
            "@typescript-eslint/explicit-function-return-type": "error",
            "@typescript-eslint/no-floating-promises": "error",
        },
    },
    {
        files: ["*.vue", "**/*.vue"],
        languageOptions: {
            parserOptions: {
                parser: "@typescript-eslint/parser",
                parserOptions: {
                    projectService: true,
                    tsconfigRootDir: import.meta.dirname,
                    warnOnUnsupportedTypeScriptVersion: false,
                },
            },
        },
        rules: {
            "@typescript-eslint/explicit-function-return-type": "error",
            "vue/html-self-closing": [
                "error",
                {
                    html: {
                        void: "always",
                        normal: "always",
                        component: "always",
                    },
                    svg: "always",
                    math: "always",
                },
            ],
            "vue/html-indent": [
                "error",
                2,
                {
                    "attribute": 1,
                    "baseIndent": 1,
                    "closeBracket": 0,
                    "alignAttributesVertically": true,
                    "ignores": [],
                },
            ],
            "vue/max-attributes-per-line": [
                "error", {
                    "singleline": {
                        "max": 1,
                    },
                    "multiline": {
                        "max": 1,
                    },
                },
            ],
        },
    },
);
