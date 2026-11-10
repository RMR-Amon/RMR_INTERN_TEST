import type { Season, Theme } from '@/types'
import { buildSprites, type Sprite } from './sprites'

interface Particle {
  x: number
  y: number
  vy: number
  size: number
  depth: number // 0.4 (far) … 1 (near)
  rot: number
  vrot: number
  flip: number
  vflip: number
  sway: number
  swaySpeed: number
  swayAmp: number
  sprite: number
  alpha: number
}

interface SeasonProfile {
  /** particles per 1440×900 viewport at "medium" */
  density: number
  size: [number, number]
  speed: [number, number] // px / second
  swayAmp: [number, number]
  rotSpeed: number
  tumble: boolean
  wind: number
  alpha: [number, number]
}

const PROFILES: Record<Season, SeasonProfile> = {
  spring: { density: 38, size: [9, 17], speed: [28, 60], swayAmp: [18, 46], rotSpeed: 1.2, tumble: true, wind: 22, alpha: [0.55, 0.95] },
  summer: { density: 12, size: [14, 24], speed: [55, 110], swayAmp: [2, 8], rotSpeed: 0.6, tumble: false, wind: 6, alpha: [0.75, 1] },
  autumn: { density: 30, size: [14, 26], speed: [32, 70], swayAmp: [26, 64], rotSpeed: 1.6, tumble: true, wind: 30, alpha: [0.65, 1] },
  winter: { density: 110, size: [2.5, 9], speed: [18, 55], swayAmp: [8, 28], rotSpeed: 0.4, tumble: false, wind: 18, alpha: [0.45, 0.95] },
}

const rand = (min: number, max: number) => min + Math.random() * (max - min)

export interface EngineOptions {
  season: Season
  theme: Theme
  /** density multiplier (intensity × active-test damping) */
  density: number
  /** overall opacity multiplier */
  opacity: number
}

/**
 * Canvas particle engine. Frame-rate independent, pauses on hidden tabs,
 * caps DPR and particle count to keep CPU/GPU usage low.
 */
export class SeasonalEngine {
  private ctx: CanvasRenderingContext2D
  private sprites: Sprite[]
  private particles: Particle[] = []
  private profile: SeasonProfile
  private raf = 0
  private last = 0
  private time = 0
  private width = 0
  private height = 0
  private dpr = 1
  private options: EngineOptions
  private readonly canvas: HTMLCanvasElement

  constructor(canvas: HTMLCanvasElement, options: EngineOptions) {
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) throw new Error('Canvas 2D is not supported')
    this.canvas = canvas
    this.ctx = ctx
    this.options = options
    this.profile = PROFILES[options.season]
    this.sprites = buildSprites(options.season, options.theme)
    this.resize()
    window.addEventListener('resize', this.resize)
    document.addEventListener('visibilitychange', this.onVisibility)
  }

  start() {
    if (this.raf) return
    this.last = performance.now()
    this.raf = requestAnimationFrame(this.tick)
  }

  stop() {
    cancelAnimationFrame(this.raf)
    this.raf = 0
  }

  destroy() {
    this.stop()
    window.removeEventListener('resize', this.resize)
    document.removeEventListener('visibilitychange', this.onVisibility)
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  update(options: EngineOptions) {
    const seasonChanged = options.season !== this.options.season
    const themeChanged = options.theme !== this.options.theme
    this.options = options
    if (seasonChanged) {
      this.profile = PROFILES[options.season]
      this.particles = []
    }
    if (seasonChanged || themeChanged) this.sprites = buildSprites(options.season, options.theme)
    this.syncCount()
  }

  private onVisibility = () => {
    if (document.hidden) this.stop()
    else this.start()
  }

  private resize = () => {
    this.dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    this.width = window.innerWidth
    this.height = window.innerHeight
    this.canvas.width = Math.floor(this.width * this.dpr)
    this.canvas.height = Math.floor(this.height * this.dpr)
    this.canvas.style.width = `${this.width}px`
    this.canvas.style.height = `${this.height}px`
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
    this.syncCount()
  }

  private targetCount() {
    const area = (this.width * this.height) / (1440 * 900)
    const scale = Math.min(1.4, Math.max(0.35, area))
    return Math.round(this.profile.density * scale * this.options.density)
  }

  private syncCount() {
    const target = this.targetCount()
    while (this.particles.length < target) this.particles.push(this.spawn(true))
    if (this.particles.length > target) this.particles.length = target
  }

  private spawn(anywhere: boolean): Particle {
    const p = this.profile
    const depth = rand(0.4, 1)
    return {
      x: rand(-40, this.width + 40),
      y: anywhere ? rand(-this.height, this.height) : rand(-80, -20),
      vy: rand(p.speed[0], p.speed[1]) * depth,
      size: rand(p.size[0], p.size[1]) * depth,
      depth,
      rot: rand(0, Math.PI * 2),
      vrot: rand(-p.rotSpeed, p.rotSpeed),
      flip: rand(0, Math.PI * 2),
      vflip: rand(1, 3),
      sway: rand(0, Math.PI * 2),
      swaySpeed: rand(0.6, 1.6),
      swayAmp: rand(p.swayAmp[0], p.swayAmp[1]),
      sprite: Math.floor(Math.random() * this.sprites.length),
      alpha: rand(p.alpha[0], p.alpha[1]) * (0.55 + depth * 0.45),
    }
  }

  private tick = (now: number) => {
    const dt = Math.min(0.05, (now - this.last) / 1000) // clamp after tab switches
    this.last = now
    this.time += dt
    this.step(dt)
    this.draw()
    this.raf = requestAnimationFrame(this.tick)
  }

  private step(dt: number) {
    // gentle global wind with slow gusts
    const wind = (Math.sin(this.time * 0.23) * 0.6 + Math.sin(this.time * 0.07 + 1.3) * 0.4) * this.profile.wind
    for (let i = 0; i < this.particles.length; i++) {
      const pt = this.particles[i]
      pt.sway += pt.swaySpeed * dt
      pt.y += pt.vy * dt
      pt.x += (wind * pt.depth + Math.cos(pt.sway) * pt.swayAmp * 0.9) * dt
      pt.rot += pt.vrot * dt
      pt.flip += pt.vflip * dt
      if (pt.y > this.height + 40 || pt.x < -80 || pt.x > this.width + 80) {
        this.particles[i] = this.spawn(false)
      }
    }
  }

  private draw() {
    const { ctx } = this
    ctx.clearRect(0, 0, this.width, this.height)
    const tumble = this.profile.tumble
    const opacity = this.options.opacity
    for (const pt of this.particles) {
      const sprite = this.sprites[pt.sprite]
      const scale = pt.size / sprite.size
      ctx.globalAlpha = pt.alpha * opacity
      ctx.setTransform(this.dpr, 0, 0, this.dpr, pt.x * this.dpr, pt.y * this.dpr)
      ctx.rotate(pt.rot)
      // 3D-like tumbling for petals and leaves
      ctx.scale(scale * (tumble ? Math.max(0.15, Math.abs(Math.cos(pt.flip))) : 1), scale)
      ctx.drawImage(sprite.canvas, -sprite.canvas.width / 2, -sprite.canvas.height / 2)
    }
    ctx.globalAlpha = 1
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
  }
}
