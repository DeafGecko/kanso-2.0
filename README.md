# Kanso

Kanso is a focused writing application built with React and TypeScript. It provides a distraction-free editor with configurable themes, typography, writing limits, file operations, and keyboard-driven tools.

## Features

- Light, Coffee, and Dark themes
- Configurable font family and editor font size
- Word, paragraph, page, and character metrics
- Optional writing limits with non-blocking warnings
- Find and replace
- Command Palette
- Text transformations for uppercase, lowercase, and title case
- Import and export for text and Markdown files
- Focus Mode
- Persistent documents and preferences
- Header pen logo that plays a short click sound on hover

The Toolbox provides access to editor settings, writing limits, text tools, and file actions. Individual Toolbox sections can be enabled or hidden.

## Local Data

Documents and preferences are stored in the browser with Zustand persistence. Kanso does not require an account or upload writing to a remote service.

## Keyboard Shortcuts

Use `Cmd` on macOS and `Ctrl` on Windows or Linux.

- `Cmd/Ctrl + F`: Open Find and Replace.
- `Cmd/Ctrl + Shift + F`: Toggle Focus Mode.
- `Cmd/Ctrl + J`: Toggle writing metrics.
- `Cmd/Ctrl + K` or `Alt + /`: Toggle the Command Palette.
- `?`: Toggle the keyboard shortcut reference when focus is outside an input.
- `Cmd/Ctrl + =` or `Cmd/Ctrl + +`: Increase the editor font size.
- `Cmd/Ctrl + -`: Decrease the editor font size.
- `Escape`: Close the active dialog or floating panel.
- `Tab` or `Shift + Tab`: Move focus between controls.

### Find And Replace

- `Enter` or `Arrow Down`: Go to the next match.
- `Shift + Enter` or `Arrow Up`: Go to the previous match.
- `Cmd/Ctrl + Enter`: Replace all matches.

### Command Palette And Font Menu

- `Arrow Up` or `Arrow Down`: Navigate options.
- `Home` or `End`: Move to the first or last option.
- `Enter`: Activate the selected option.
- `Escape`: Close the active menu.

### Editor Expansions

Type a trigger in the editor and press `Tab`.

- `==`: Horizontal divider
- `date`: Current local date
- `h1`: Level-one Markdown heading
- `todo`: Markdown task item

### Moving A Floating Window

Focus a floating panel's drag handle and use the arrow keys to move it in 10-pixel increments.

## Accessibility

Kanso is designed around WCAG 2.2 AA guidance. It includes keyboard-operable controls, visible focus states, focus management for dialogs, screen-reader announcements for file actions, reduced-motion support, and responsive layouts with appropriately sized targets.

## Development

### Prerequisites

- Node.js
- npm

Install dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

Run validation and create a production build:

```bash
npm run lint
npm run build
```

Run the unit tests (Vitest) and browser tests (Playwright, including axe accessibility checks):

```bash
npm test
npm run test:e2e
```

Playwright starts its own dev server on port 5199. Stop anything else on that port before running it.

Run Lighthouse against a local dev server on port 5173:

```bash
npm run dev
npm run lighthouse
```

Lighthouse on the dev server is less accurate than on the live site. Use the deployed URL for performance numbers.

### Documentation

- [Case study](docs/case-study.md): the header toggle, pen logo, test setup, and deploy history.
- [Known issues](docs/known-issues.md): open issues, what we know about each, and how to settle them.
- [Unit and browser tests](docs/unit-tests.md): how the suite is organized, how to run and extend it, and troubleshooting.

## Technology

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Zustand
- Vitest and Testing Library (unit tests)
- Playwright and axe (browser and accessibility tests)
