## Code Style & Comments Rule

- **No Code Comments:**
  - Do NOT include any comments inside code snippets or generated files (no inline comments, no block comments, and no docstrings like JSDoc/TSDoc/Python docstrings unless explicitly requested).
  - Write clean, self-explanatory, and declarative code where variable, function, and component names convey the intent.
  - If an explanation is necessary, provide it in the chat response text, NOT inside the code.
  - Do not add placeholder comments like `// TODO: ...`, `// implementation goes here`, or `// Add styles here`.

## Type Definitions Rule

- **Centralized Types:**
  - All TypeScript types, interfaces, and form input contracts must be defined in the `src/types/` directory (e.g. `@/types/...`).
  - Do NOT define interfaces or types locally/inline inside components, hooks, or feature files.
  - Always export types from the relevant file inside `src/types/` and import them where needed.

  