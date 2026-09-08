const VOICE_STORAGE_KEY = 'english-study:tts-voice-uri';

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

function getVoiceList(): SpeechSynthesisVoice[] {
  if (!isSpeechSupported()) return [];
  return window.speechSynthesis.getVoices();
}

export function getEnglishVoices(): SpeechSynthesisVoice[] {
  return getVoiceList().filter((v) => v.lang.toLowerCase().startsWith('en'));
}

/**
 * Chrome populates the voice list asynchronously, so a plain getVoices()
 * call right after page load often returns an empty array.
 */
export function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  if (!isSpeechSupported()) return Promise.resolve([]);
  const existing = getVoiceList();
  if (existing.length > 0) return Promise.resolve(existing);
  return new Promise((resolve) => {
    const handle = () => {
      window.speechSynthesis.removeEventListener('voiceschanged', handle);
      resolve(getVoiceList());
    };
    window.speechSynthesis.addEventListener('voiceschanged', handle);
    setTimeout(() => resolve(getVoiceList()), 1000);
  });
}

const QUALITY_HINTS = ['natural', 'premium', 'enhanced', 'online', 'google', 'neural'];

// macOS/iOS ship a set of "fun" novelty voices (System Settings > Spoken
// Content) that speechSynthesis exposes right alongside the real ones. Their
// base name isn't translated even when the rest of the label is, so this
// still matches on a Turkish system. Never auto-pick these.
const NOVELTY_VOICE_NAMES = new Set([
  'albert', 'bad news', 'kötü haber', 'bahh', 'bells', 'boing', 'bubbles',
  'cellos', 'good news', 'i̇yi haber', 'iyi haber', 'jester', 'organ', 'org',
  'ralph', 'superstar', 'trinoids', 'whisper', 'wobble', 'zarvox',
  'deranged', 'hysterical', 'pipe organ',
]);

// Well-established, natural-sounding default narrator voices — used as a
// tiebreaker so we land on one of these instead of an arbitrary novelty or
// character voice that happens to sort first.
const PREFERRED_VOICE_NAMES = [
  'samantha', 'ava', 'alex', 'daniel', 'karen', 'moira', 'tessa', 'serena',
  'susan', 'allison', 'nicky', 'zoe', 'evan',
];

function baseVoiceName(name: string): string {
  return name.split('(')[0].trim().toLowerCase();
}

/**
 * The default voice a browser picks is often the lowest-quality (or even a
 * novelty/joke) one it ships with, even though a much better one is
 * installed. Score candidates so we can auto-select the best-sounding
 * English voice instead.
 */
function scoreVoice(voice: SpeechSynthesisVoice): number {
  const fullName = voice.name.toLowerCase();
  const base = baseVoiceName(voice.name);
  let score = 0;
  if (NOVELTY_VOICE_NAMES.has(base)) score -= 10;
  if (PREFERRED_VOICE_NAMES.includes(base)) score += 4;
  if (QUALITY_HINTS.some((hint) => fullName.includes(hint))) score += 5;
  if (!voice.localService) score += 3;
  if (voice.lang.toLowerCase() === 'en-us') score += 1;
  return score;
}

export function pickBestVoice(
  voices: SpeechSynthesisVoice[],
): SpeechSynthesisVoice | null {
  const english = voices.filter((v) => v.lang.toLowerCase().startsWith('en'));
  if (english.length === 0) return null;
  return [...english].sort((a, b) => scoreVoice(b) - scoreVoice(a))[0];
}

export function getStoredVoiceURI(): string | null {
  try {
    return localStorage.getItem(VOICE_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setPreferredVoiceURI(uri: string | null): void {
  try {
    if (uri) localStorage.setItem(VOICE_STORAGE_KEY, uri);
    else localStorage.removeItem(VOICE_STORAGE_KEY);
  } catch {
    // localStorage unavailable (e.g. private browsing) — fall back to auto-pick.
  }
}

function resolveVoice(): SpeechSynthesisVoice | null {
  const voices = getVoiceList();
  const storedURI = getStoredVoiceURI();
  if (storedURI) {
    const stored = voices.find((v) => v.voiceURI === storedURI);
    if (stored) return stored;
  }
  return pickBestVoice(voices);
}

export function speak(text: string, lang = 'en-US'): void {
  if (!isSpeechSupported() || !text.trim()) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const voice = resolveVoice();
  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang;
  } else {
    utterance.lang = lang;
  }
  utterance.rate = 0.95;
  window.speechSynthesis.speak(utterance);
}
