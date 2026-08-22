# KANSO — Write Without the Noise

> _Kanso_ is a Japanese word. It means **simplicity**. Remove what does not belong. Keep what matters.

---

## What Is This?

**Kanso** is a writing app built for one thing — helping you focus on your words.

No big menus. No pop-ups begging for your attention. No distractions hiding in the corners.

Just you. A blank page. And a quiet place to think.

---

## What It Looks Like

Picture a single card sitting on a dark screen.

That card is your writing space.

On the right side, a panel slides open when you need it — your **Toolbox**. When you don't need it, it disappears. Out of sight. Out of mind.

Three themes to match how you feel:

- **Light** — soft gray, easy on the eyes, warm and calm
- **Coffee** — warm brown tones, like writing by lamplight
- **Dark** — deep black, late-night focus mode

---

## What It Does

### Write

Open it. Start typing. That's it.

The writing area fades softly at the top and bottom — so the edges never feel sharp or cut off. Your words flow naturally into the space.

### Spell Check

Kanso uses nspell and Hunspell dictionaries for English, French, and Spanish. It detects the language of each paragraph, underlines misspelled words, and offers keyboard-accessible replacement suggestions.

### The Toolbox

Slide open the panel on the right. Here you can:

- Switch your **theme** — light, coffee, or dark
- Change your **font** — from classic Georgia to modern Inter and more
- Set **word limits**, **paragraph limits**, and **page limits** — so you know when to stop
- Choose which Toolbox widgets are visible
- **Save** your writing to a file, **open** an old file, or start a **New Document**
- Transform your text — **ALL CAPS**, **all lowercase**, or **Title Case** — in one click
- Keep quick notes in the adjustable **Scratchpad**

Your theme, font, font size, limits, Toolbox visibility, and open or closed Toolbox state are saved in browser local storage and restored when you return.

### Focus Tools

See your character, word, paragraph, and page counts in the warning bar. When a limit is reached, open the **Writing Limits Reached** dialog for a clear summary.

### Accessibility

Kanso includes keyboard-operable controls, visible focus states, accessible names and control states, focus-managed dialogs, screen-reader status announcements for file actions, reduced-motion support, responsive reflow, and appropriately sized interactive targets. These features are designed to support WCAG 2.2 AA use cases.

---

## Keyboard Shortcuts

Use `Cmd` on macOS or `Ctrl` on Windows and Linux unless a shortcut says otherwise.

### App

| Shortcut                         | Action                                                           |
| -------------------------------- | ---------------------------------------------------------------- |
| `Cmd/Ctrl + F`                   | Open Find & Replace; selected editor text fills the search field |
| `Cmd/Ctrl + Shift + F`           | Toggle Focus Mode                                                |
| `Cmd/Ctrl + J`                   | Toggle document statistics and writing limits                    |
| `Cmd/Ctrl + K` or `Alt + /`      | Toggle the Command Palette                                       |
| `Cmd/Ctrl + =` or `Cmd/Ctrl + +` | Increase editor font size                                        |
| `Cmd/Ctrl + -`                   | Decrease editor font size                                        |
| `Escape`                         | Close the active dialog or floating panel                        |
| `Tab` / `Shift + Tab`            | Move through controls; focus stays inside an open modal dialog   |

### Find & Replace

| Shortcut                      | Action                   |
| ----------------------------- | ------------------------ |
| `Enter` or `Arrow Down`       | Go to the next match     |
| `Shift + Enter` or `Arrow Up` | Go to the previous match |
| `Cmd/Ctrl + Enter`            | Replace all matches      |

### Command Palette And Menus

| Shortcut                  | Action                                                |
| ------------------------- | ----------------------------------------------------- |
| `Arrow Up` / `Arrow Down` | Move through command or font options                  |
| `Home` / `End`            | Move to the first or last font option                 |
| `Enter`                   | Run the selected command or activate a focused option |
| `Escape`                  | Close the palette or font menu and restore focus      |

### Editor Expansions

Type a trigger and press `Tab`:

| Trigger | Expansion                  |
| ------- | -------------------------- |
| `==`    | Horizontal divider         |
| `date`  | Current local date         |
| `h1`    | Level-one Markdown heading |
| `todo`  | Markdown task item         |

### Accessible Adjustments

| Focused control            | Shortcut                  | Action                        |
| -------------------------- | ------------------------- | ----------------------------- |
| Spelling underline         | `Enter` or `Space`        | Open spelling suggestions     |
| Scratchpad resize handle   | `Arrow Up` / `Arrow Down` | Resize by 10 pixels           |
| Scratchpad resize handle   | `Home` / `End`            | Set minimum or maximum height |
| Floating panel drag handle | Arrow keys                | Move the panel by 10 pixels   |

---

## How to Run It

You need **Node.js** installed on your computer.

```bash
# Install everything it needs
npm install

# Start it up
npm run dev
```

Then open your browser and go to the address it gives you. Usually something like `http://localhost:5173`.

Before publishing changes, run:

```bash
npm run lint
npm run build
```

---

## The Philosophy

Most writing apps try to do everything.

Kanso does not.

Kanso believes that **a quiet space makes better writing**. It believes that tools should stay out of the way until you need them. It believes the words are what matter — not the app around them.

Write one sentence. Then another. Then another.

That is all.

---

_Built with React, TypeScript, and Vite._
_Spell checking powered by nspell + Hunspell dictionaries._
_Language detection powered by franc._
_Preferences and documents persisted locally with Zustand._
