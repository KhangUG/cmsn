import type { SectionId } from './store.ts'

export type Shot = {
  pos: [number, number, number]
  look: [number, number, number]
}

export type SectionSpan = {
  id: Exclude<SectionId, 'intro'>
  start: number
  end: number
}

const DESKTOP: Record<Exclude<SectionId, 'intro'>, Shot> = {
  world: { pos: [-0.45, 1.32, 6.75], look: [0.95, 0.22, 0] },
  memories: { pos: [0.15, 2.2, 12.6], look: [0, 1.05, -1.2] },
  gift: { pos: [0.1, 0.92, 5.05], look: [0, 0.12, 0] },
  cake: { pos: [0.02, 1.18, 4.45], look: [0, 0.5, 0] },
  letter: { pos: [-0.35, 1.72, 8.9], look: [0, 0.82, 0] },
  finale: { pos: [0, 2.65, 13.4], look: [0, 1.9, 0] },
}

const MOBILE: Record<Exclude<SectionId, 'intro'>, Shot> = {
  world: { pos: [0, 1.72, 8.35], look: [0, -0.05, 0] },
  memories: { pos: [0, 2.35, 13.6], look: [0, 1.15, -1] },
  gift: { pos: [0, 1.25, 6.45], look: [0, -0.05, 0] },
  cake: { pos: [0, 1.55, 6.15], look: [0, 0.15, 0] },
  letter: { pos: [0, 1.85, 10.2], look: [0, 0.62, 0] },
  finale: { pos: [0, 2.45, 14.2], look: [0, 1.55, 0] },
}

export function shotFor(section: Exclude<SectionId, 'intro'>, mobile: boolean) {
  return (mobile ? MOBILE : DESKTOP)[section]
}

function smoothstep(value: number) {
  const t = Math.min(1, Math.max(0, value))
  return t * t * (3 - 2 * t)
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function mix(a: Shot, b: Shot, t: number): Shot {
  return {
    pos: [lerp(a.pos[0], b.pos[0], t), lerp(a.pos[1], b.pos[1], t), lerp(a.pos[2], b.pos[2], t)],
    look: [lerp(a.look[0], b.look[0], t), lerp(a.look[1], b.look[1], t), lerp(a.look[2], b.look[2], t)],
  }
}

export function computeShot(progress: number, spans: SectionSpan[], mobile: boolean): Shot {
  if (spans.length === 0) return shotFor('world', mobile)
  let index = spans.findIndex((span) => progress <= span.end + 0.0001)
  if (index < 0) index = spans.length - 1
  const current = spans[index]
  const next = spans[index + 1]
  const from = shotFor(current.id, mobile)
  if (!next) return from
  const local = (progress - current.start) / Math.max(0.0001, current.end - current.start)
  const blend = smoothstep(Math.min(1, Math.max(0, (local - 0.7) / 0.3)))
  return mix(from, shotFor(next.id, mobile), blend)
}
