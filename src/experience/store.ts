import { useSyncExternalStore } from 'react'
import type Lenis from 'lenis'
import { birthdayConfig } from '../config/birthday.ts'

export type SectionId = 'intro' | 'world' | 'memories' | 'gift' | 'cake' | 'letter' | 'finale'
export type Quality = 'high' | 'low'

type Snapshot = {
  introDone: boolean
  section: SectionId
  wishMade: boolean
  giftOpen: boolean
  reducedMotion: boolean
}

function detectReduced() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function detectCompact() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(max-width: 760px)').matches
}

function detectQuality(): Quality {
  if (typeof window === 'undefined') return 'high'
  const cores = navigator.hardwareConcurrency ?? 8
  return detectCompact() || cores <= 4 ? 'low' : 'high'
}

export const lenisRef: { current: Lenis | null } = { current: null }

/** Tween these with GSAP. The render loop copies them onto `store`. */
export const anim = {
  introZoom: 0,
  wish: 0,
  gift: 0,
}

export const store = {
  introDone: false,
  opening: false,
  introZoom: 0,
  progress: 0,
  section: 'intro' as SectionId,
  sectionT: 0,
  finale: 0,
  wish: 0,
  gift: 0,
  giftHover: 0,
  burstToken: 0,
  pointerX: 0,
  pointerY: 0,
  camX: 0,
  camY: 1.5,
  camZ: 9.8,
  lookX: 0,
  lookY: 0.42,
  lookZ: 0,
  compact: detectCompact(),
  quality: detectQuality(),
  reducedMotion: detectReduced(),
  intensity: birthdayConfig.animation.intensity,
  particles: birthdayConfig.animation.particles,
}

let snapshot: Snapshot = {
  introDone: false,
  section: 'intro',
  wishMade: false,
  giftOpen: false,
  reducedMotion: store.reducedMotion,
}

const listeners = new Set<() => void>()

export function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getSnapshot() {
  return snapshot
}

export function commit(partial: Partial<Snapshot>) {
  snapshot = { ...snapshot, ...partial }
  for (const listener of listeners) listener()
}

export function useExperience() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}
