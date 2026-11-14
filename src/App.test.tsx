import { describe, it, expect, beforeAll } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import App from './App';

beforeAll(() => {
  // jsdom lacks matchMedia; App reads it for theme/motion checks
  if (!window.matchMedia) {
    window.matchMedia = (query: string) =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }) as MediaQueryList;
  }
});

// The store defaults to the sidebar being open, so tests read the toggle's
// current label rather than assuming a starting state.
const headerToggle = () => within(document.querySelector('header')!).getByRole('button', { name: /preferences/i });

describe('header preferences toggle', () => {
  it('stays in the header and is the only close control when the sidebar is open', () => {
    render(<App />);

    if (headerToggle().getAttribute('aria-expanded') !== 'true') {
      fireEvent.click(headerToggle());
    }

    expect(headerToggle()).toHaveAttribute('aria-label', 'Close preferences');
    expect(screen.getAllByRole('button', { name: /close preferences/i })).toHaveLength(1);
    expect(document.querySelector('aside[data-toolbox]')!.querySelector('button[aria-label="Close preferences"]')).toBeNull();
  });

  it('toggles the sidebar from the header in both directions', () => {
    render(<App />);

    const start = headerToggle().getAttribute('aria-expanded');
    fireEvent.click(headerToggle());
    expect(headerToggle()).toHaveAttribute('aria-expanded', start === 'true' ? 'false' : 'true');

    fireEvent.click(headerToggle());
    expect(headerToggle()).toHaveAttribute('aria-expanded', start);
  });
});
