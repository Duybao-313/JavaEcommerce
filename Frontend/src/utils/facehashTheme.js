import { stringHash } from 'facehash'

const DEFAULT_NAME = 'user'

const COLOR_PALETTES = [
  ['#0ea5e9', '#38bdf8', '#22c55e', '#f59e0b', '#f97316'],
  ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316'],
  ['#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1'],
  ['#22c55e', '#84cc16', '#eab308', '#f97316', '#ef4444'],
  ['#a855f7', '#ec4899', '#f43f5e', '#fb7185', '#f97316'],
  ['#10b981', '#34d399', '#22c55e', '#84cc16', '#eab308'],
]

const BASE_FACEHASH_PROPS = {
  variant: 'gradient',
  intensity3d: 'subtle',
  interactive: false,
  showInitial: true,
}

function normalizeFacehashName(name) {
  if (typeof name !== 'string') return DEFAULT_NAME
  const trimmed = name.trim()
  return trimmed.length > 0 ? trimmed : DEFAULT_NAME
}

export function getFacehashProps(name, overrides = {}) {
  const safeName = normalizeFacehashName(name)
  const paletteIndex = Math.abs(stringHash(safeName)) % COLOR_PALETTES.length

  return {
    name: safeName,
    colors: COLOR_PALETTES[paletteIndex],
    ...BASE_FACEHASH_PROPS,
    ...overrides,
  }
}
