const palettes = [
  ["#f97316", "#9a3412"],
  ["#14b8a6", "#0f766e"],
  ["#6366f1", "#3730a3"],
  ["#ec4899", "#831843"],
  ["#eab308", "#713f12"],
  ["#22c55e", "#14532d"],
  ["#06b6d4", "#155e75"],
  ["#a855f7", "#581c87"],
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
