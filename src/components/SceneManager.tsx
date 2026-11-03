import { useLayoutEffect } from 'react'
import type { ReactNode } from 'react'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { computeShot, type SectionSpan } from '../experience/camera.ts'
import { gsap, ScrollTrigger } from '../experience/gsap.ts'
import { commit, lenisRef, store } from '../experience/store.ts'
import type { SectionId } from '../experience/store.ts'

const JOURNEY = new Set<string>(['world', 'memories', 'gift', 'cake', 'letter', 'finale'])

function isJourneySection(value: string | undefined): value is Exclude<SectionId, 'intro'> {
  return value !== undefined && JOURNEY.has(value)
}

export function useSceneScroll(enabled: boolean, reducedMotion: boolean) {
  useLayoutEffect(() => {
    if (!enabled) return

    const update = () => {
      const root = document.getElementById('journey')
      if (!root) return
      store.compact = window.matchMedia('(max-width: 760px)').matches
      const total = root.scrollHeight - window.innerHeight
      const scrolled = Math.min(Math.max(-root.getBoundingClientRect().top, 0), Math.max(total, 0))
      const progress = total <= 0 ? 0 : scrolled / total
      store.progress = progress

      const sections = [...root.querySelectorAll<HTMLElement>('[data-section]')]
      const spans: SectionSpan[] = []
      let consumed = 0
      for (const section of sections) {
        const id = section.dataset.section
        if (!isJourneySection(id)) continue
        const height = section.offsetHeight
        const start = total <= 0 ? 0 : consumed / Math.max(total, 1)
        consumed += height
        spans.push({ id, start, end: total <= 0 ? 1 : consumed / Math.max(total, 1) })
      }

      const shot = computeShot(progress, spans, store.compact)
      store.camX = shot.pos[0]
      store.camY = shot.pos[1]
      store.camZ = shot.pos[2]
      store.lookX = shot.look[0]
      store.lookY = shot.look[1]
      store.lookZ = shot.look[2]

      const marker = window.innerHeight * 0.46
      let active: Exclude<SectionId, 'intro'> = spans[0]?.id ?? 'world'
      let localT = 0
      for (const section of sections) {
        const id = section.dataset.section
        if (!isJourneySection(id)) continue
        const rect = section.getBoundingClientRect()
        if (rect.top <= marker && rect.bottom > marker) {
          active = id
          localT = (marker - rect.top) / Math.max(rect.height, 1)
          break
        }
      }
      if (progress > 0.985 && spans.length > 0) {
        active = spans[spans.length - 1].id
        localT = 1
      }
      store.sectionT = Math.min(1, Math.max(0, localT))
      store.finale = active === 'finale' ? store.sectionT : 0
      if (active !== store.section) {
        store.section = active
        commit({ section: active })
      }
    }

    update()

    if (reducedMotion) {
      window.addEventListener('scroll', update, { passive: true })
      window.addEventListener('resize', update)
      return () => {
        window.removeEventListener('scroll', update)
        window.removeEventListener('resize', update)
      }
    }

    const lenis = new Lenis({
      duration: 1.15,
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 0.92,
      autoRaf: false,
    })
    lenisRef.current = lenis
    lenis.on('scroll', update)

    const tick = (time: number) => {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    const trigger = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: update,
    })
    window.addEventListener('resize', update)

    return () => {
      window.removeEventListener('resize', update)
      trigger.kill()
      gsap.ticker.remove(tick)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [enabled, reducedMotion])
}

export function SceneManager({
  enabled,
  reducedMotion,
  children,
}: {
  enabled: boolean
  reducedMotion: boolean
  children: ReactNode
}) {
  useSceneScroll(enabled, reducedMotion)
  return children
}
