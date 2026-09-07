import type { RefObject } from 'react';

export type FormatAction = 'bold' | 'italic' | 'heading' | 'list' | 'highlight';

const wrappers: Record<FormatAction, { prefix: string; suffix: string; block?: boolean }> = {
  bold: { prefix: '**', suffix: '**' },
  italic: { prefix: '_', suffix: '_' },
  heading: { prefix: '## ', suffix: '', block: true },
  list: { prefix: '- ', suffix: '', block: true },
  highlight: { prefix: '==', suffix: '==' },
};

export function applyFormat(
  textareaRef: RefObject<HTMLTextAreaElement | null>,
  action: FormatAction,
  value: string,
  onChange: (next: string) => void,
) {
  const el = textareaRef.current;
  if (!el) return;
  const { selectionStart, selectionEnd } = el;
  const { prefix, suffix, block } = wrappers[action];
  const selected = value.slice(selectionStart, selectionEnd);

  let next: string;
  let cursor: number;

  if (block) {
    const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
    next = value.slice(0, lineStart) + prefix + value.slice(lineStart);
    cursor = selectionEnd + prefix.length;
  } else {
    next =
      value.slice(0, selectionStart) +
      prefix +
      selected +
      suffix +
      value.slice(selectionEnd);
    cursor = selectionEnd + prefix.length + (selected ? suffix.length : 0);
  }

  onChange(next);
  requestAnimationFrame(() => {
    el.focus();
    el.setSelectionRange(cursor, cursor);
  });
}

/** Renders a small markdown-lite subset used by the notes editor. */
export function renderRichText(source: string): string {
  const escaped = source
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const lines = escaped.split('\n');
  const html: string[] = [];
  let inList = false;

  for (const line of lines) {
    const listMatch = line.match(/^-\s+(.*)/);
    if (listMatch) {
      if (!inList) {
        html.push('<ul class="list-disc pl-5 space-y-0.5">');
        inList = true;
      }
      html.push(`<li>${inline(listMatch[1])}</li>`);
      continue;
    }
    if (inList) {
      html.push('</ul>');
      inList = false;
    }

    const headingMatch = line.match(/^##\s+(.*)/);
    if (headingMatch) {
      html.push(
        `<h3 class="text-base font-semibold mt-2">${inline(headingMatch[1])}</h3>`,
      );
      continue;
    }

    if (line.trim() === '') {
      html.push('<br/>');
    } else {
      html.push(`<p>${inline(line)}</p>`);
    }
  }
  if (inList) html.push('</ul>');

  return html.join('');
}

function inline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    .replace(
      /==(.+?)==/g,
      '<mark class="bg-amber-200 dark:bg-amber-500/40 rounded px-0.5">$1</mark>',
    );
}
