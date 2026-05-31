/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { join } from "node:path";

import eslint from "@eslint/js";
import sortImports from "@j4cobi/eslint-plugin-sort-imports";
import licenseHeader from "eslint-plugin-license-header";
import unicorn from "eslint-plugin-unicorn";
import unusedImports from "eslint-plugin-unused-imports";
import tseslint from "typescript-eslint";

/**
 *
 * @param {{ tsconfigDirName: string }} config
 * @returns workspace eslint config
 */
export function defineConfig({ tsconfigDirName }) {
  return tseslint.config(
    { ignores: ["dist", "node_modules", ".next", "pkg"] },
    eslint.configs.recommended,
    ...tseslint.configs.strict,
    {
      languageOptions: {
        parserOptions: {
          project: [join(tsconfigDirName, "./tsconfig.json")],
          tsconfigDirName,
        },
      },
      rules: {
        "@typescript-eslint/ban-ts-comment": "off", // replaced by oxlint typescript/ban-ts-comment
        "@typescript-eslint/default-param-last": "off", // replaced by oxlint typescript/default-param-last
        "@typescript-eslint/explicit-member-accessibility": "off", // replaced by oxlint typescript/explicit-member-accessibility
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
        "@typescript-eslint/no-unsafe-declaration-merging": "off",
        "@typescript-eslint/no-unsafe-argument": "off",
        "@typescript-eslint/no-unsafe-assignment": "off",
        "@typescript-eslint/no-unsafe-call": "off",
        "@typescript-eslint/no-unsafe-return": "off",
        "@typescript-eslint/no-unused-vars": "off",
        "@typescript-eslint/no-extraneous-class": "off",
      },
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
        "unicorn/import-style": "off", // replaced by oxlint unicorn/import-style
        "unicorn/no-array-callback-reference": "off",
        "unicorn/no-array-for-each": "off",
        "unicorn/no-array-reduce": "off",
        "unicorn/no-await-expression-member": "off",
        "unicorn/no-null": "off",
        "unicorn/no-object-as-default": "off",
        "unicorn/no-process-exit": "off",
        "unicorn/no-static-only-class": "off",
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
        "unicorn/prefer-at": "off", // replaced by oxlint unicorn/prefer-at
        "unicorn/prefer-string-replace-all": "off",
        "unicorn/prevent-abbreviations": "off",
        "unicorn/relative-url-style": "off", // replaced by oxlint unicorn/relative-url-style
        "unicorn/switch-case-braces": "off", // replaced by oxlint unicorn/switch-case-braces
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
    },
    {
      plugins: {
        "license-header": licenseHeader,
        "sort-imports": sortImports,
        "unused-imports": unusedImports,
      },
      rules: {
        "arrow-body-style": "off", // replaced by oxlint
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
        "import/no-anonymous-default-export": "off",
        "no-constant-binary-expression": "off", // replaced by oxlint
        "no-constructor-return": "off", // replaced by oxlint
        "no-duplicate-imports": "off", // replaced by oxlint
        "no-lonely-if": "off", // replaced by oxlint
        "object-shorthand": "off", // replaced by oxlint
        "one-var": ["error", "never"],
        "prefer-template": "off", // replaced by oxlint
        "sort-imports/sort-imports": [
          "error",
          {
            ignoreCase: false,
            ignoreMemberSort: false,
            memberSyntaxSortOrder: ["all", "single", "multiple", "none"],
          },
        ],
      },
    }
  );
}
