// 🎨 Prettier Configuration - Life Simulator Azerbaijan
// Создано: DevOps (Agile Team)
// Версия: 3.0.0

module.exports = {
  // Print width - line length that Prettier will try to maintain
  printWidth: 80,
  
  // Tab width - number of spaces per indentation-level
  tabWidth: 2,
  
  // Use tabs instead of spaces
  useTabs: false,
  
  // Semicolons at the ends of statements
  semi: true,
  
  // Use single quotes instead of double quotes
  singleQuote: true,
  
  // Quote style for object properties
  quoteProps: 'as-needed',
  
  // Use single quotes in JSX
  jsxSingleQuote: true,
  
  // Trailing commas where valid in ES5 (objects, arrays, etc.)
  trailingComma: 'es5',
  
  // Spaces between brackets in object literals
  bracketSpacing: true,
  
  // Put the > of a multi-line JSX element at the end of the last line
  bracketSameLine: false,
  
  // Include parentheses around a sole arrow function parameter
  arrowParens: 'avoid',
  
  // Format only files that have a pragma comment
  requirePragma: false,
  
  // Insert pragma comment at the top of formatted files
  insertPragma: false,
  
  // How to handle whitespace in prose
  proseWrap: 'preserve',
  
  // How to handle whitespace in HTML
  htmlWhitespaceSensitivity: 'css',
  
  // Line ending style
  endOfLine: 'lf',
  
  // Control whether Prettier formats quoted code embedded in the file
  embeddedLanguageFormatting: 'auto',
  
  // Enforce single attribute per line in HTML, Vue and JSX
  singleAttributePerLine: false,
  
  // Plugin-specific configurations
  overrides: [
    {
      files: '*.{ts,tsx}',
      options: {
        // TypeScript specific options
        parser: 'typescript',
      },
    },
    {
      files: '*.{js,jsx}',
      options: {
        // JavaScript specific options
        parser: 'babel',
      },
    },
    {
      files: '*.{json,jsonc}',
      options: {
        // JSON specific options
        parser: 'json',
        trailingComma: 'none',
      },
    },
    {
      files: '*.{md,mdx}',
      options: {
        // Markdown specific options
        parser: 'markdown',
        proseWrap: 'always',
        printWidth: 100,
      },
    },
    {
      files: '*.{yml,yaml}',
      options: {
        // YAML specific options
        parser: 'yaml',
        singleQuote: false,
      },
    },
  ],
};
