/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import globals from "globals";
import js from "@eslint/js";
import licenseHeader from "eslint-plugin-license-header";
import sortImports from "eslint-plugin-sort-imports-es6-autofix";
import stylistic from "@stylistic/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import tslint from "@typescript-eslint/eslint-plugin";
import unusedImports from "eslint-plugin-unused-imports";
import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [{
  ignores: ["**/dist", "**/node_modules"],
}, ...compat.extends(
  "eslint:recommended",
  "plugin:@typescript-eslint/eslint-recommended",
  "plugin:@typescript-eslint/recommended",
  "plugin:unicorn/recommended"
), {
  plugins: {
    "@typescript-eslint": tslint,
    "license-header": licenseHeader,
    "sort-imports-es6-autofix": sortImports,
    "unused-imports": unusedImports,
    stylistic,
  },

  languageOptions: {
    globals: {
      ...globals.commonjs,
      ...globals.node,
    },

    parser: tsParser,
    ecmaVersion: "latest",
    sourceType: "module",
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
    "@typescript-eslint/ban-types": [
      "off",
    ],
    "@typescript-eslint/default-param-last": [
      "error",
    ],
    "@typescript-eslint/explicit-member-accessibility": [
      "error",
    ],
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
    "@typescript-eslint/no-explicit-any": [
      "off",
    ],
    "@typescript-eslint/no-non-null-assertion": [
      "off",
    ],
    "@typescript-eslint/no-unsafe-declaration-merging": [
      "off",
    ],
    "@typescript-eslint/no-unused-vars": [
      "off",
    ],
    "arrow-body-style": [
      "error",
      "as-needed",
    ],
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
    "no-constant-binary-expression": [
      "error",
    ],
    "no-constructor-return": [
      "error",
    ],
    "no-duplicate-imports": [
      "error",
    ],
    "no-extra-semi": [
      "error",
    ],
    "no-floating-decimal": [
      "error",
    ],
    "no-lonely-if": [
      "error",
    ],
    "no-multiple-empty-lines": [
      "error",
      {
        max: 1,
        maxEOF: 1,
      },
    ],
    "object-shorthand": [
      "error",
      "always",
    ],
    "one-var": [
      "error",
      "never",
    ],
    "prefer-template": [
      "error",
    ],
    "quote-props": [
      "error",
      "consistent-as-needed",
    ],
    "sort-imports-es6-autofix/sort-imports-es6": [
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
    ],
    "stylistic/comma-dangle": [
      "error",
      {
        arrays: "always-multiline",
        objects: "always-multiline",
        imports: "always-multiline",
        exports: "always-multiline",
        functions: "never",
      },
    ],
    "stylistic/generator-star-spacing": [
      "error",
      {
        before: false,
        after: true,
      },
    ],
    "stylistic/indent": [
      "error",
      2,
      {
        SwitchCase: 1,
      },
    ],
    "stylistic/max-len": [
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
    "stylistic/quotes": [
      "error",
      "double",
    ],
    "stylistic/semi": [
      "error",
      "always",
    ],
    "stylistic/type-generic-spacing": "error",
    "stylistic/yield-star-spacing": [
      "error",
      {
        before: false,
        after: true,
      },
    ],
    "unicorn/better-regex": [
      "off",
    ],
    "unicorn/catch-error-name": [
      "off",
    ],
    "unicorn/consistent-destructuring": [
      "off",
    ],
    "unicorn/escape-case": [
      "off",
    ],
    "unicorn/explicit-length-check": [
      "off",
    ],
    "unicorn/filename-case": [
      "off",
    ],
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
    "unicorn/no-array-callback-reference": [
      "off",
    ],
    "unicorn/no-array-for-each": [
      "off",
    ],
    "unicorn/no-array-reduce": [
      "off",
    ],
    "unicorn/no-await-expression-member": [
      "off",
    ],
    "unicorn/no-null": [
      "off",
    ],
    "unicorn/no-object-as-default": [
      "off",
    ],
    "unicorn/no-process-exit": [
      "off",
    ],
    "unicorn/no-static-only-class": [
      "off",
    ],
    "unicorn/no-unsafe-regex": [
      "warn",
    ],
    "unicorn/no-useless-switch-case": [
      "off",
    ],
    "unicorn/no-useless-undefined": [
      "off",
    ],
    "unicorn/number-literal-case": [
      "off",
    ],
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
    "unicorn/prefer-at": [
      "error",
    ],
    "unicorn/prefer-string-replace-all": [
      "off",
    ],
    "unicorn/prevent-abbreviations": [
      "off",
    ],
    "unicorn/relative-url-style": [
      "error",
      "always",
    ],
    "unicorn/switch-case-braces": [
      "error",
      "avoid",
    ],
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
  },
}];