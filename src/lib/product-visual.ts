// Muted earth tones that sit inside the warm Pasar palette. Dark enough for
// the cream product initial drawn on top of the gradient.
const palettes = [
  ["#a6533a", "#74392a"], // terracotta
  ["#5c7049", "#3c4b30"], // olive
  ["#9c6b48", "#6e482f"], // clay
  ["#2f6b53", "#1d4736"], // pine
  ["#a38342", "#755c28"], // ochre
  ["#7a4f5a", "#54343d"], // plum
  ["#3e6a6a", "#274646"], // teal
  ["#5b4a6b", "#3b2f49"], // aubergine
] as const

export function productGradient(seed: string): string {
  let hash = 0
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0
  }
  const [from, to] = palettes[hash % palettes.length]
  return `linear-gradient(135deg, ${from} 0%, ${to} 100%)`
}

export function productInitial(name: string): string {
  const trimmed = name.trim()
  return trimmed.length > 0 ? trimmed[0].toUpperCase() : "?"
}
