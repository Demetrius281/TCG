/** A value in square brackets, e.g. "[TEXT]" or "[quote]", is a placeholder: it stays in the content file but is not rendered. */
export const isPlaceholder = (value: unknown): boolean => typeof value === 'string' && /\[[^\]]*\]/.test(value);
