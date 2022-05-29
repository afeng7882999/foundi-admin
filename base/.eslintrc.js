const { defineConfig } = require('eslint-define-config')

module.exports = defineConfig({
  root: true,
  env: {
    browser: true,
    node: true,
    es6: true
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'plugin:prettier/recommended'
  ],
  rules: {
    'vue/max-attributes-per-line': 'off',
    indent: ['off', 2, { SwitchCase: 1 }],
    'no-debugger': 'off',
    'no-prototype-builtins': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    'vue/no-v-html': 'off',
    'vue/require-default-prop': 'off',
    'vue/multi-word-component-names': 'off'
  },
  globals: {
    defineProps: 'writable',
    defineEmits: 'writable',
    defineExpose: 'writable',
    defineOptions: 'writable'
  },
  ignorePatterns: ['build/*.js', 'src/assets', 'public', 'dist']
})
