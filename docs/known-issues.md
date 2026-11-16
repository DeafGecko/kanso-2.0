# Known Issues

Written for: maintainers triaging Kanso.

Each item lists the status, what we know, and what would settle it. Items marked **Unverified** were not checked in this session.

## Open

### 1. Hover sound may be blocked on first hover
- **Area:** Pen icon and KANSO wordmark sound (`src/utils/penSound.ts`)
- **Status:** Open. Browser behavior, not a code bug.
- **Detail:** Browsers only allow audio after a user gesture such as a click or key press. Hover is not a gesture, so the first hover may be silent until the user has clicked or typed on the page. The sound code catches errors, so nothing breaks. We confirmed the handler runs without console errors, but we have not listened to the sound.
- **To settle:** Test in Chrome, Safari, and Firefox with a fresh page load, hovering first and clicking second.

### 2. Pen detail is small at 32px
- **Area:** Pen icon (`src/App.tsx`)
- **Status:** Open. Design choice.
- **Detail:** At 32px the white band and the clip are only a few pixels wide. We checked the header in light, coffee, and dark, but not at other sizes or on mobile widths.
- **To settle:** Review the header on a phone-width screen, then decide whether the band and clip should be heavier.

### 3. Contrast is only checked for the default theme
- **Area:** Accessibility
- **Status:** Partly open.
- **Detail:** The axe test in `e2e/header-toggle.spec.ts` runs on the default dark theme, with the sidebar open and closed. Light and coffee were checked only by screenshot. Some components were not scanned: the Command Palette uses 50% opacity badges, and the Find and Replace history timestamps use 40% opacity. These may fail the same contrast rule.
- **To settle:** Extend the axe test to loop over all three themes and to open the Command Palette and Find and Replace.

### 4. Favicon support in older Safari
- **Area:** `public/favicon.svg`
- **Status:** Unverified.
- **Detail:** Modern browsers accept SVG favicons. Some older Safari versions do not, and fall back to no icon or the default. We did not test those versions.
- **To settle:** Check the tab icon in an older Safari, or add a PNG fallback.

### 5. Lighthouse script hardcodes port 5173
- **Area:** `package.json` `lighthouse` script
- **Status:** Open.
- **Detail:** Vite moves to 5174 or another port when 5173 is busy. The Lighthouse script and the Playwright config (which uses 5199) do not follow that change. The script will fail if nothing is running on 5173.
- **To settle:** Use `--port` with a fixed value in the script, or let the script start its own server.

### 6. Unit test coverage is narrow
- **Area:** Vitest (`src/App.test.tsx`)
- **Status:** Open. Known gap.
- **Detail:** There are two unit tests, both for the header toggle. Nothing tests the store, persistence, text tools, metrics, limits, or file import and export. See [unit-tests.md](unit-tests.md).
- **To settle:** Add tests for each area, starting with the store's persistence and the word and paragraph limits.

### 7. Browser tests cover one feature
- **Area:** Playwright (`e2e/header-toggle.spec.ts`)
- **Status:** Open. Known gap.
- **Detail:** The three browser tests check only the header toggle, the axe scan, and screenshots. The screenshots are not compared against a baseline, so a visual regression will not fail the test.
- **To settle:** Add flows for writing, saving, and importing files, and consider visual snapshot tests.

### 8. Lighthouse performance on the dev server is not meaningful
- **Area:** Performance measurement
- **Status:** Known limitation.
- **Detail:** The dev server serves unbundled modules, so its numbers are lower than production. The live site scored 100 on performance. Treat the dev-server score as a rough signal only.
- **To settle:** Run Lighthouse against `npm run build` and `npm run preview`, or against the live URL.

### 9. npm audit reports vulnerabilities
- **Area:** Dependencies
- **Status:** Unverified.
- **Detail:** `npm install` printed a suggestion to run `npm audit fix`. We did not review or apply those fixes, because they can change dependency versions.
- **To settle:** Run `npm audit`, review each advisory, and upgrade deliberately.

### 10. Vercel CLI is not set up here
- **Area:** Deployment
- **Status:** Known limitation.
- **Detail:** Deploys happen through the GitHub integration. This machine has no Vercel CLI or project link, so we confirmed each deploy through GitHub commit statuses and the live URL.
- **To settle:** Install the Vercel CLI and link the project if you want deploys from the terminal.

## Resolved

### R1. Sidebar close control moved into the panel
- Fixed in PR #1. The header button now stays in place and toggles the sidebar.

### R2. Production build failed on `manualChunks`
- Fixed in PR #1. The option is a function, so `npm run build` and Vercel deploys pass.

### R3. Low-contrast sidebar labels
- Fixed in PR #1 for the Toolbox labels, the font sub-labels, the limit labels, and the Text Transform label. The three-pass search for these is noted in the case study.

### R4. Merge commit title has a placeholder
- Commit `bd4ae20` on `main` ends with `(#PR)` in its subject, because the squash-merge subject was not filled in. We did not rewrite `main` to fix it. It has no effect on the build.

### R5. Lint was reported as needing fixes
- Re-checked. `npm run lint` (oxlint) exits with code 0 and no warnings.
