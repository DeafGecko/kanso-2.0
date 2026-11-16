# Unit and Browser Tests

Written for: developers who run or extend the Kanso test suite.

Kanso has two kinds of automated tests:

- **Unit tests** with Vitest and Testing Library, in jsdom. They render components and check behavior in code.
- **Browser tests** with Playwright and axe. They open the app in Chrome and check behavior and accessibility.

## Running the Tests

```bash
npm test            # Vitest unit tests
npm run test:e2e    # Playwright browser tests (desktop and mobile)
npm run lint        # oxlint
npm run build       # Type check and production build
```

Run `npm run build` before merging. It runs the same command Vercel uses, so it catches configuration errors that the tests do not.

Playwright starts its own dev server on port 5199. Stop anything else on that port first, or Playwright will refuse to start.

## Current Results

| Suite | Count | Result |
|---|---|---|
| Vitest (`src/App.test.tsx`) | 2 | Pass |
| Playwright (`e2e/header-toggle.spec.ts`, desktop and mobile) | 6 (3 tests × 2 projects) | Pass |
| oxlint | Whole project | Exit code 0 |

## Unit Tests (Vitest)

### Files

| File | Purpose |
|---|---|
| `vitest.config.ts` | Uses jsdom and the React plugin. Runs `src/**/*.test.{ts,tsx}`. |
| `src/test/setup.ts` | Loads `@testing-library/jest-dom`, unmounts components after each test, and clears `localStorage`. |
| `src/App.test.tsx` | Tests for the header preferences toggle. |

### What is tested

1. **The toggle stays in the header and is the only close control when the sidebar is open.** It checks that the header control's label is "Close preferences", that exactly one such control exists, and that the sidebar has no second one.
2. **The toggle flips the sidebar in both directions.** It reads the starting `aria-expanded` value, clicks once, checks the flip, clicks again, and checks the return.

### How the tests handle state

The preferences store opens the sidebar by default, and a saved preference can close it. The tests do not assume a starting state. They read the current `aria-expanded` value and act from there. A test that assumed "closed at start" failed for this reason, so keep this pattern when you add tests.

### jsdom gaps

jsdom does not implement `window.matchMedia`. `App.test.tsx` installs a stub in `beforeAll` when it's missing. If a new test fails with "matchMedia is not a function", the stub is not being applied to that file.

### Adding a unit test

1. Create `src/<area>.test.tsx` or `src/<area>.test.ts`. The config picks it up automatically.
2. Import from `vitest` and `@testing-library/react`.
3. Query by role and accessible name, as the existing tests do. Prefer `getByRole` to `querySelector`. The header test uses `querySelector` only where the element has no accessible role.
4. Reset state through the store or `localStorage`. The setup file clears `localStorage` after each test.

## Browser Tests (Playwright and axe)

### Files

| File | Purpose |
|---|---|
| `playwright.config.ts` | Starts `vite --port 5199 --strictPort`. Defines desktop (1440×900) and mobile (Pixel 7) projects. |
| `e2e/header-toggle.spec.ts` | Three tests for the header toggle. |

### What is tested

1. **Stays in the header in both states.** Checks the header control's label and visibility, and that no second close control exists in the sidebar.
2. **No serious or critical axe violations, open and closed.** Runs axe with the WCAG 2.0 A/AA and 2.1 A/AA tags, once with the sidebar closed and once open. Any violation with impact `serious` or `critical` fails the test. The failure message lists each rule and the element selectors that triggered it, so you can find the element without re-running.
3. **Screenshots both states.** Saves `open.png` and `closed.png` and attaches them to the report. This does not compare against a baseline.

### Known limits of the axe test

- It checks the default dark theme only. Light and coffee are not scanned.
- It does not open the Command Palette or Find and Replace.
- Serious and critical violations fail the test. Moderate and minor violations are attached to the report but do not fail it.

### Reports and traces

- Test output and traces are written to `test-results/`, which is git-ignored.
- A failed test keeps a Playwright trace. Open it with `npx playwright show-trace <path>`.

### Adding a browser test

1. Add a `test(...)` block to `e2e/header-toggle.spec.ts`, or create a new `e2e/*.spec.ts`.
2. Use the same state-reading helpers (`ensureOpen`, `ensureClosed`) when a test depends on the sidebar state.
3. For an axe check, copy the `AxeBuilder` pattern in the existing test and keep the WCAG tag list.

## Troubleshooting

| Symptom | Cause and fix |
|---|---|
| Playwright says port 5199 is already in use | A dev server is still running from an earlier run. Stop it with `pkill -f "vite --port 5199"`. |
| `Cannot find package '@testing-library/dom'` | The Testing Library peer dependency is missing. Run `npm install -D @testing-library/dom`. |
| Playwright cannot find a browser | The tests use the installed Chrome channel for manual checks. Run `npx playwright install chromium` if the bundled browser is missing. |
| Vitest fails with "Unable to find an element" | The sidebar is in the opposite state from what the test assumed. Read `aria-expanded` first, as the existing tests do. |
| `npm run build` fails in `vite.config.ts` | `manualChunks` must stay a function. An object will fail under Vite 8. |

## Coverage Gaps

The suite does not yet cover the store and persistence, word and paragraph limits, text transforms, metrics, file import and export, Focus Mode, or keyboard shortcuts. See [known-issues.md](known-issues.md), item 6, for the plan.
