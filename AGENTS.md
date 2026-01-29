# Repository Guidelines

## Project Structure & Module Organization
- Root contains two subdirectories: `mrrainbowsmoke/` and `rainbowsmokeofficial.com/`.
- Each subdirectory currently only has `.env` and `.gitignore` files; there is no source code or test folder yet.
- Plan to keep runtime code inside a dedicated folder (e.g., `src/`) and tests in `tests/` or `__tests__/` once the project grows.

## Build, Test, and Development Commands
- No build, test, or dev commands are defined yet.
- When you add tooling, document commands here with examples, such as:
  - `npm run dev` — start local development server.
  - `npm test` — run the test suite.
  - `npm run build` — produce production assets.

## Coding Style & Naming Conventions
- No formatting or linting rules are currently configured.
- When introducing code, prefer a repo-wide formatter (e.g., Prettier, gofmt, black) and document it here.
- Keep file and directory names lowercase and hyphenated where possible (e.g., `user-profile/`, `site-header.tsx`).

## Testing Guidelines
- No test framework is configured.
- When adding tests, document the framework and naming pattern (e.g., `*.test.ts`, `*_spec.rb`).
- Include a single command to run all tests and, if applicable, a focused command (e.g., `npm test -- user-profile`).

## Commit & Pull Request Guidelines
- This directory is not currently a Git repository; no commit history is available.
- If Git is initialized, use clear, imperative commit messages (e.g., "Add landing page hero").
- Pull requests should include a short description, steps to verify, and screenshots for UI changes.

## Security & Configuration Tips
- Do not commit `.env` files or secrets. Use `.env.example` for shared configuration.
- Validate new configuration values locally before sharing.
