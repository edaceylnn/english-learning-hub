export interface ParsedWordRow {
  term: string;
  translation: string;
  valid: boolean;
  raw: string;
}

const DELIMITER = /\s+[-–]\s+|[:;]\s+|\t+/;

export function parseBulkWords(text: string): ParsedWordRow[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((raw) => {
      const match = DELIMITER.exec(raw);
      if (!match) return { term: raw, translation: '', valid: false, raw };

      const term = raw.slice(0, match.index).trim();
      const translation = raw.slice(match.index + match[0].length).trim();
      if (!term || !translation) {
        return { term: raw, translation: '', valid: false, raw };
      }
      return { term, translation, valid: true, raw };
    });
}
