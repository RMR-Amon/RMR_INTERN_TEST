import type { Technology } from '@/types'

const FALLBACK_COLORS: Record<string, string> = {
  html: '#f97316',
  css: '#3b82f6',
  javascript: '#eab308',
  react: '#22d3ee',
  typescript: '#2563eb',
  scss: '#ec4899',
  tailwind: '#06b6d4',
}

export const techColor = (id: string, technologies?: Technology[]) =>
  technologies?.find((t) => t.id === id)?.color ?? FALLBACK_COLORS[id] ?? '#8b5cf6'

export const techName = (id: string, technologies?: Technology[]) =>
  technologies?.find((t) => t.id === id)?.name ?? id.toUpperCase()
