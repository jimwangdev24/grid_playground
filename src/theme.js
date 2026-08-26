// Single source of truth for card tones + shadows, shared by the live
// preview (classes) and the code exporter (raw CSS values).
export const TONES = {
  white: { label: 'White', bg: '#ffffff', text: '#1e1e1e' },
  dark: { label: 'Dark', bg: '#1e1e1e', text: '#ffffff' },
  lavender: { label: 'Lavender', bg: '#b18cfe', text: '#1e1e1e' },
  lime: { label: 'Lime', bg: '#c8f14f', text: '#1e1e1e' },
}

// A card's tone is either a TONES key or a custom "#rrggbb" hex. For custom
// colors, pick black or white text by perceived luminance for contrast.
export function toneStyle(tone) {
  if (TONES[tone]) return TONES[tone]
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(tone.slice(i, i + 2), 16))
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return { label: tone, bg: tone, text: luminance > 0.6 ? '#1e1e1e' : '#ffffff' }
}

// Seeded Lorem Picsum URLs: same seed always returns the same photo, so the
// preview and exported code stay stable across reloads.
const seeds = ['audio', 'studio', 'forest', 'city', 'retro', 'coast']
export const IMAGES = seeds.map((seed) => `https://picsum.photos/seed/${seed}/640/480`)

// Opacity of the tone-color wash over background images (keeps text readable).
export const OVERLAY_ALPHA = 0.78

export function withAlpha(hex, alpha) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export const SHADOWS = [
  'none',
  '0 1px 3px rgba(0, 0, 0, 0.08)',
  '0 6px 16px rgba(0, 0, 0, 0.12)',
  '0 14px 32px rgba(0, 0, 0, 0.18)',
]
