/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').options} */
const config = {
  plugins: ["prettier-plugin-tailwindcss"],
  trailingComma: 'es5',
  arrowParens: 'always',
  singleQuote: true,
  tabWidth: 4,
  semi: false,
  printWidth: 120,
  bracketSameLine: false,
};

export default config;
