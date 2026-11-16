# Kanso Case Study: Header Toggle, Pen Logo, and Test Setup

Written for: the Kanso maintainer and anyone who joins the project later.

## Summary

Kanso is a React and TypeScript writing app with no backend. Over one session we fixed a confusing sidebar toggle, added a pen logo with a hover sound, set up unit and browser tests with accessibility checks, repaired a production build that was blocking deploys, and shipped the work to Vercel through GitHub pull requests.

## Problem

The preferences sidebar had two controls. The header button opened it, but once it was open the close control moved inside the sidebar. The button jumped from the top of the page into the panel, which made it hard to find and close.

## Goals

1. Keep one open/close control in the header in both states.
2. Add a solid pen icon beside the KANSO wordmark that matches each theme.
3. Give the pen a hover click sound without shipping an audio file.
4. Put automated checks in place: unit tests, browser tests, accessibility checks, and Lighthouse.
5. Ship each change to `main` and confirm the Vercel deploy.

## What We Did

### 1. Header toggle

- The header button now renders in both states and toggles the sidebar. Its label and icon change to match the state.
- The duplicate close button inside the Toolbox sidebar was removed.
- Change: `src/App.tsx`, merged in PR #1.

### 2. Accessibility contrast

The axe scan flagged small sidebar labels as low contrast. Those labels were raised from 40–50% opacity to 70%. The first pass missed three label variants, so the change needed three rounds before the scan passed.

### 3. Tests

- **Vitest** runs unit tests for the header toggle in jsdom.
- **Playwright** runs browser tests on desktop and mobile. Each run also runs an axe WCAG A/AA scan with the sidebar open and closed.
- Both are wired as `npm test` and `npm run test:e2e`.

### 4. Production build fix

`npm run build` was failing before any of this work. The `manualChunks` option in `vite.config.ts` was written as an object, which this Vite version rejects. Vercel runs the same build command, so the deploy would have failed. The option was converted to a function that keeps the same three chunk groups.

### 5. Pen logo and hover sound

- A solid pen glyph sits to the left of KANSO. It is 32px, uses the theme text color, and is solid black in light mode.
- Hovering the pen or the wordmark plays a short synthesized ballpoint click, generated with the Web Audio API. There is no audio file. A 250 ms throttle keeps moving across both elements from stacking sounds.
- The logo keeps the default cursor and is not text-selectable.
- Changes: `src/App.tsx`, `src/utils/penSound.ts`, PR #2.

### 6. Favicon

The embedded PNG favicon was replaced with the same pen glyph as an SVG on a black rounded square, with a white pen. Change: `public/favicon.svg`, PRs #3 and #4.

## Decisions

- **Inline SVG for the pen, not an icon library.** Lucide has no filled pen, and the reference design needed a clip and a band. Drawing it inline let us match the shape and keep it themeable through `currentColor`.
- **Synthesized sound, not an mp3.** It adds no asset, no network request, and nothing to license.
- **Feature branches and squash merges.** Each change went to its own branch, then to `main` by a squash-merged PR. This keeps `main` readable and gives each deploy a clear commit.
- **Test the behavior, not the starting state.** The store opens the sidebar by default, but a saved preference can close it. The tests read the toggle's current `aria-expanded` value before acting, so they pass in either state.

## Results

| Check | Result |
|---|---|
| Vitest (unit) | 2 of 2 pass |
| Playwright (desktop and mobile, with axe) | 6 of 6 pass |
| Lint (oxlint) | Clean, exit code 0 |
| Production build | Passes |
| Lighthouse, live site | Performance 100, Accessibility 100, Best Practices 100, SEO 100 |
| Lighthouse, dev server | Performance 78, Accessibility 100, Best Practices 100, SEO 91 |

Lighthouse on the dev server runs an unbundled build, so its performance score is pessimistic. Use the live-site numbers as the reference.

## Lessons

- **Run the same build command the host runs.** The Vercel build failed on a config error that only showed up when we ran `npm run build` locally. Running it before merging would have caught it earlier.
- **Measure what ships.** Dev-server Lighthouse looked worse than the real site on every category. Auditing the deployed URL gave the number that matters.
- **Fix every variant of a class.** A search for one class name missed the label variants that also used that color. Searching for the color pattern, or running axe again after each change, catches the rest.
- **Small icons need a size check.** A clip and band that look clear at 44px disappear at 32px. Check the final size in the real header.

## Open Items

See [known-issues.md](known-issues.md) for the full list and [unit-tests.md](unit-tests.md) for how to run and extend the tests.
