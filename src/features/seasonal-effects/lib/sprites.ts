import type { Season, Theme } from '@/types'

/**
 * Each particle is drawn ONCE into a small offscreen canvas ("sprite"),
 * then blitted every frame with drawImage — far cheaper than redrawing paths.
 */
export interface Sprite {
  canvas: HTMLCanvasElement
  /** natural size in CSS px at scale 1 */
  size: number
}

const SPRITE_PX = 96

const makeCanvas = (draw: (ctx: CanvasRenderingContext2D, s: number) => void): HTMLCanvasElement => {
  const canvas = document.createElement('canvas')
  canvas.width = SPRITE_PX
  canvas.height = SPRITE_PX
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.translate(SPRITE_PX / 2, SPRITE_PX / 2)
    draw(ctx, SPRITE_PX / 2)
  }
  return canvas
}

// ----------------------------------------------------------------- Spring
const petal = (inner: string, outer: string) =>
  makeCanvas((ctx, s) => {
    const g = ctx.createRadialGradient(0, s * 0.35, 2, 0, 0, s * 0.9)
    g.addColorStop(0, inner)
    g.addColorStop(1, outer)
    ctx.fillStyle = g
    ctx.beginPath()
    // heart-tipped sakura petal
    ctx.moveTo(0, s * 0.8)
    ctx.bezierCurveTo(s * 0.75, s * 0.35, s * 0.6, -s * 0.55, s * 0.12, -s * 0.78)
    ctx.lineTo(0, -s * 0.6)
    ctx.lineTo(-s * 0.12, -s * 0.78)
    ctx.bezierCurveTo(-s * 0.6, -s * 0.55, -s * 0.75, s * 0.35, 0, s * 0.8)
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(0, s * 0.65)
    ctx.quadraticCurveTo(s * 0.05, 0, 0, -s * 0.5)
    ctx.stroke()
  })

// ----------------------------------------------------------------- Summer
const apple = (base: string, light: string, dark: string) =>
  makeCanvas((ctx, s) => {
    const r = s * 0.62
    // body (two lobes)
    const g = ctx.createRadialGradient(-r * 0.35, -r * 0.2, r * 0.1, 0, r * 0.1, r * 1.15)
    g.addColorStop(0, light)
    g.addColorStop(0.55, base)
    g.addColorStop(1, dark)
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.moveTo(0, -r * 0.62)
    ctx.bezierCurveTo(r * 0.55, -r * 1.05, r * 1.15, -r * 0.55, r * 1.0, r * 0.2)
    ctx.bezierCurveTo(r * 0.9, r * 0.85, r * 0.4, r * 1.05, 0, r * 0.88)
    ctx.bezierCurveTo(-r * 0.4, r * 1.05, -r * 0.9, r * 0.85, -r * 1.0, r * 0.2)
    ctx.bezierCurveTo(-r * 1.15, -r * 0.55, -r * 0.55, -r * 1.05, 0, -r * 0.62)
    ctx.fill()
    // highlight
    ctx.fillStyle = 'rgba(255,255,255,0.45)'
    ctx.beginPath()
    ctx.ellipse(-r * 0.45, -r * 0.25, r * 0.16, r * 0.28, -0.5, 0, Math.PI * 2)
    ctx.fill()
    // stem
    ctx.strokeStyle = '#6b3f1d'
    ctx.lineWidth = s * 0.07
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(0, -r * 0.55)
    ctx.quadraticCurveTo(r * 0.05, -r * 0.95, r * 0.22, -r * 1.2)
    ctx.stroke()
    // leaf
    ctx.fillStyle = '#4ade80'
    ctx.beginPath()
    ctx.moveTo(r * 0.12, -r * 0.95)
    ctx.quadraticCurveTo(r * 0.55, -r * 1.45, r * 0.95, -r * 1.05)
    ctx.quadraticCurveTo(r * 0.5, -r * 0.75, r * 0.12, -r * 0.95)
    ctx.fill()
  })

// ----------------------------------------------------------------- Autumn
const leaf = (fill: string, vein: string) =>
  makeCanvas((ctx, s) => {
    const g = ctx.createLinearGradient(-s, -s, s, s)
    g.addColorStop(0, fill)
    g.addColorStop(1, vein)
    ctx.fillStyle = g
    ctx.beginPath()
    // maple-like silhouette with 5 lobes
    const pts: [number, number][] = [
      [0, -0.95], [0.18, -0.55], [0.55, -0.72], [0.45, -0.3], [0.9, -0.2],
      [0.55, 0.05], [0.7, 0.4], [0.25, 0.3], [0.08, 0.62], [0, 0.55],
      [-0.08, 0.62], [-0.25, 0.3], [-0.7, 0.4], [-0.55, 0.05], [-0.9, -0.2],
      [-0.45, -0.3], [-0.55, -0.72], [-0.18, -0.55],
    ]
    pts.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x * s, y * s) : ctx.lineTo(x * s, y * s)))
    ctx.closePath()
    ctx.fill()
    // veins + stem
    ctx.strokeStyle = 'rgba(60,25,5,0.45)'
    ctx.lineWidth = 1.6
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(0, s * 0.95)
    ctx.lineTo(0, -s * 0.75)
    ctx.moveTo(0, -s * 0.05)
    ctx.lineTo(s * 0.62, -s * 0.18)
    ctx.moveTo(0, -s * 0.05)
    ctx.lineTo(-s * 0.62, -s * 0.18)
    ctx.moveTo(0, s * 0.2)
    ctx.lineTo(s * 0.45, s * 0.33)
    ctx.moveTo(0, s * 0.2)
    ctx.lineTo(-s * 0.45, s * 0.33)
    ctx.stroke()
  })

// ----------------------------------------------------------------- Winter
const softFlake = (light: boolean) =>
  makeCanvas((ctx, s) => {
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, s * 0.6)
    // on light backgrounds pure white is invisible → icy blue tint
    g.addColorStop(0, light ? 'rgba(125,180,235,1)' : 'rgba(255,255,255,1)')
    g.addColorStop(0.4, light ? 'rgba(147,197,253,0.85)' : 'rgba(240,248,255,0.85)')
    g.addColorStop(1, light ? 'rgba(191,219,254,0)' : 'rgba(220,235,255,0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(0, 0, s * 0.6, 0, Math.PI * 2)
    ctx.fill()
  })

const crystalFlake = (light: boolean) =>
  makeCanvas((ctx, s) => {
    ctx.strokeStyle = light ? 'rgba(96,165,250,0.95)' : 'rgba(235,245,255,0.95)'
    ctx.lineCap = 'round'
    ctx.shadowColor = 'rgba(180,220,255,0.9)'
    ctx.shadowBlur = 6
    for (let i = 0; i < 6; i++) {
      ctx.save()
      ctx.rotate((Math.PI / 3) * i)
      ctx.lineWidth = s * 0.07
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(0, -s * 0.8)
      ctx.stroke()
      ctx.lineWidth = s * 0.05
      for (const d of [0.35, 0.58]) {
        ctx.beginPath()
        ctx.moveTo(0, -s * d)
        ctx.lineTo(s * 0.2, -s * (d + 0.17))
        ctx.moveTo(0, -s * d)
        ctx.lineTo(-s * 0.2, -s * (d + 0.17))
        ctx.stroke()
      }
      ctx.restore()
    }
    ctx.fillStyle = light ? '#60a5fa' : '#fff'
    ctx.beginPath()
    ctx.arc(0, 0, s * 0.1, 0, Math.PI * 2)
    ctx.fill()
  })

export const buildSprites = (season: Season, theme: Theme = 'dark'): Sprite[] => {
  const light = theme === 'light'
  const wrap = (canvas: HTMLCanvasElement): Sprite => ({ canvas, size: SPRITE_PX / 2 })
  switch (season) {
    case 'spring':
      return [
        petal('#fff1f6', '#f9a8d4'),
        petal('#ffffff', '#fbcfe8'),
        petal('#fde2ec', '#f472b6'),
        petal('#ffffff', '#fce7f3'),
      ].map(wrap)
    case 'summer':
      return [
        apple('#dc2626', '#fca5a5', '#7f1d1d'),
        apple('#ef4444', '#fecaca', '#991b1b'),
        apple('#65a30d', '#d9f99d', '#365314'),
        apple('#84cc16', '#ecfccb', '#3f6212'),
      ].map(wrap)
    case 'autumn':
      return [
        leaf('#fb923c', '#c2410c'),
        leaf('#ef4444', '#991b1b'),
        leaf('#facc15', '#ca8a04'),
        leaf('#a16207', '#713f12'),
        leaf('#f97316', '#b91c1c'),
      ].map(wrap)
    case 'winter':
      return [softFlake(light), softFlake(light), crystalFlake(light)].map(wrap)
  }
}
