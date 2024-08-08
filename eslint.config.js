/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import eslint from "@eslint/js";
import licenseHeader from "eslint-plugin-license-header";
import sortImports from "eslint-plugin-sort-imports-es6-autofix";
import stylistic from "@stylistic/eslint-plugin";
import tseslint from "typescript-eslint";
import unusedImports from "eslint-plugin-unused-imports";
import unicorn from "eslint-plugin-unicorn";

export default tseslint.config(
  { ignores: ["dist", "node_modules", ".next", "pkg"] },
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  {
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.json"],
        tsconfigDirName: import.meta.dirname,
      }
    },
    rules: {
      "@typescript-eslint/ban-ts-comment": [
        "error",
        {
          "minimumDescriptionLength": 3,
          "ts-check": true,
          "ts-expect-error": "allow-with-description",
          "ts-ignore": "allow-with-description",
          "ts-nocheck": true,
        },
      ],
      "@typescript-eslint/default-param-last": "error",
      "@typescript-eslint/explicit-member-accessibility": "error",
      "@typescript-eslint/member-ordering": [
        "error",
        {
          default: [
            "signature",
            "public-instance-field",
            "protected-instance-field",
            "private-instance-field",
            "instance-field",
            "public-static-field",
            "protected-static-field",
            "private-static-field",
            "static-field",
            "public-constructor",
            "protected-constructor",
            "private-constructor",
            "constructor",
            "public-instance-method",
            "protected-instance-method",
            "private-instance-method",
            "instance-method",
            "public-static-method",
            "protected-static-method",
            "private-static-method",
            "static-method",
          ],
        },
      ],
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-unsafe-declaration-merging":"off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-extraneous-class": "off"
    }
  },
  unicorn.configs["flat/recommended"],
  {
    rules: {
      "unicorn/better-regex": "off",
      "unicorn/catch-error-name": "off",
      "unicorn/consistent-destructuring": "off",
      "unicorn/escape-case": "off",
      "unicorn/explicit-length-check": "off",
      "unicorn/filename-case": "off",
      "unicorn/import-style": [
        "error",
        {
          styles: {
            "node:path": {
              named: true,
              default: false,
            },
          },
        },
      ],
      "unicorn/no-array-callback-reference": "off",
      "unicorn/no-array-for-each": "off",
      "unicorn/no-array-reduce": "off",
      "unicorn/no-await-expression-member": "off",
      "unicorn/no-null": "off",
      "unicorn/no-object-as-default": "off",
      "unicorn/no-process-exit": "off",
      "unicorn/no-static-only-class": "off",
      "unicorn/no-unsafe-regex": "warn",
      "unicorn/no-useless-switch-case": "off",
      "unicorn/no-useless-undefined": "off",
      "unicorn/number-literal-case": "off",
      "unicorn/numeric-separators-style": [
        "error",
        {
          onlyIfContainsSeparator: true,
          number: {
            minimumDigits: 5,
            groupLength: 3,
            onlyIfContainsSeparator: false,
          },
        },
      ],
      "unicorn/prefer-at": "error",
      "unicorn/prefer-string-replace-all": "off",
      "unicorn/prevent-abbreviations": "off",
      "unicorn/relative-url-style": ["error", "always"],
      "unicorn/switch-case-braces": ["error", "avoid"],
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "error",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
    }
  },
	stylistic.configs.customize({
		jsx: true,
		semi: true,
		quotes: "double",
		quoteProps: "consistent-as-needed",
    braceStyle: "1tbs",
    arrowParens: "always",
	}),
  {
    rules: {
      "@stylistic/no-extra-semi": "error",
      "@stylistic/no-floating-decimal": "error",
      "@stylistic/quote-props": ["error", "consistent-as-needed"],
      "@stylistic/no-multiple-empty-lines": ["error", { max: 1, maxEOF: 1 }],
			 "@stylistic/comma-dangle": [
        "error",
        {
          arrays: "always-multiline",
          objects: "always-multiline",
          imports: "always-multiline",
          exports: "always-multiline",
          functions: "never",
        },
      ],
      "@stylistic/generator-star-spacing": ["error", { before: false, after: true }],
      "@stylistic/indent": ["error", 2, { SwitchCase: 1 }],
      "@stylistic/max-len": [
        "error",
        {
          code: 120,
          tabWidth: 2,
          ignoreComments: true,
          ignoreTrailingComments: true,
          ignoreUrls: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
          ignoreRegExpLiterals: true,
        },
      ],
      "@stylistic/type-generic-spacing": "error",
      "@stylistic/yield-star-spacing": ["error", { before: false, after: true }],
      "@stylistic/jsx-one-expression-per-line": "off",
      "@stylistic/operator-linebreak": ["error", "after"]
    }
  },
  {
    plugins: {
      "license-header": licenseHeader,
      "sort-imports": sortImports,
      "unused-imports": unusedImports,
    },
    rules: {
      "arrow-body-style": ["error", "as-needed"],
      "license-header/header": [
        "error",
        [
          "/**",
          " * Copyright (c) Statsify",
          " *",
          " * This source code is licensed under the GNU GPL v3 license found in the",
          " * LICENSE file in the root directory of this source tree.",
          " * https://github.com/Statsify/statsify/blob/main/LICENSE",
          " */",
        ],
      ],
      "no-constant-binary-expression": "error",
      "no-constructor-return": "error",
      "no-duplicate-imports": "error",
      "no-lonely-if": "error",
      "object-shorthand": ["error", "always"],
      "one-var": ["error", "never"],
      "prefer-template": "error",
      "sort-imports/sort-imports-es6": [
        "error",
        {
          ignoreCase: false,
          ignoreMemberSort: false,
          memberSyntaxSortOrder: [
            "all",
            "single",
            "multiple",
            "none",
          ],
        },
      ]
    }
  }
);