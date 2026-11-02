/** Tiny className joiner used by every component. */
export const cn = (...parts: Array<string | false | null | undefined>): string => parts.filter(Boolean).join(' ');
