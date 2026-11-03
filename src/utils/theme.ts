export type ThemeMode = 'light' | 'system' | 'dark';

const KEY = 'ascend-theme';

export const getStoredMode = (): ThemeMode => {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'light' || v === 'dark' || v === 'system' ? v : 'dark';
  } catch {
    return 'dark';
  }
};

/** "system" follows the operating system; light/dark are fixed. */
export const resolveTheme = (mode: ThemeMode): 'light' | 'dark' =>
  mode === 'system' ? (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark') : mode;

/** Sets data-theme on <html> (the colour tokens in styles/theme.css switch on it) and remembers the choice. */
export const applyMode = (mode: ThemeMode): void => {
  document.documentElement.dataset.theme = resolveTheme(mode);
  try { localStorage.setItem(KEY, mode); } catch { /* private mode: just don't remember */ }
};
