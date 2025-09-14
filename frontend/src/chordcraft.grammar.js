// This file teaches Prism.js the syntax of our ChordCraft language.

export const chordCraftGrammar = {
  'comment': {
    pattern: /\/\/.*/,
    greedy: true,
  },
  'keyword': {
    pattern: /(^|\s)(PLAY|FOR|AT)(?=\s)/,
    lookbehind: true,
  },
  'string': {
    pattern: /'[^']*'/,
    greedy: true,
  },
  'number': {
    // Matches numbers like 0.5s, 123.45s, etc.
    pattern: /\b\d+(\.\d+)?s\b/,
  },
  'function': {
    // Matches musical notes like C4, F#5, Ab3
    pattern: /\b[A-G][#b]?\d\b/,
  },
  'operator': /[=<>!~?&|*+/\-%^]/,
};