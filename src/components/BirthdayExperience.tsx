import { Component, lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { birthdayConfig, displayName, personalize } from '../config/birthday.ts'
import { soundscape, soundWasMuted } from '../experience/audio.ts'
import { shotFor } from '../experience/camera.ts'
import { gsap } from '../experience/gsap.ts'
import { photos } from '../experience/photos.ts'
import { anim, commit, lenisRef, store, useExperience } from '../experience/store.ts'
import type { SectionId } from '../experience/store.ts'
import { AudioController } from './AudioController.tsx'
import { CinematicIntro } from './CinematicIntro.tsx'
import { CssAtmosphere } from './CssAtmosphere.tsx'
import { Journey } from './Journey.tsx'
import { PhotoModal } from './PhotoModal.tsx'
import { SceneManager } from './SceneManager.tsx'

const SceneCanvas = lazy(() =>
  import('../three/SceneCanvas.tsx').then((module) => ({ default: module.SceneCanvas })),
)

const RAIL: Array<{ id: Exclude<SectionId, 'intro'>; label: string }> = [
  { id: 'world', label: 'Lời chào' },
  { id: 'memories', label: 'Kỷ niệm' },
  { id: 'letter', label: 'Thư' },
  { id: 'finale', label: 'Kết' },
]

function detectWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

class CanvasGuard extends Component<{ children: ReactNode; onFail: () => void }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch() {
    this.props.onFail()
  }

  render() {
    if (this.state.failed) return null
    return this.props.children
  }
}

function PointerGlow() {
  const glow = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return
    const node = glow.current
    if (!node) return
    const move = (event: PointerEvent) => {
      node.style.opacity = '1'
      node.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [])

  return <div ref={glow} className="pointer-glow" />
}

function Grain() {
  const grain = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 140
    canvas.height = 140
    const context = canvas.getContext('2d')
    if (!context || !grain.current) return
    const image = context.createImageData(140, 140)
    for (let index = 0; index < image.data.length; index += 4) {
      const shade = 210 + Math.random() * 45
      image.data[index] = shade
      image.data[index + 1] = shade
      image.data[index + 2] = shade
      image.data[index + 3] = 38
    }
    context.putImageData(image, 0, 0)
    grain.current.style.backgroundImage = `url(${canvas.toDataURL('image/png')})`
  }, [])

  return <div ref={grain} className="grain" />
}

function ProgressRail({ section }: { section: SectionId }) {
  function go(id: string) {
    const target = document.getElementById(id)
    if (!target) return
    if (lenisRef.current) lenisRef.current.scrollTo(target, { offset: 0 })
    else target.scrollIntoView({ behavior: store.reducedMotion ? 'auto' : 'smooth' })
  }

  return (
    <nav className="progress-rail" aria-label="Các phần của câu chuyện">
      {RAIL.map((item) => (
        <button
          key={item.id}
          type="button"
          className={section === item.id ? 'is-active' : undefined}
          onClick={() => go(item.id)}
          aria-current={section === item.id ? 'true' : undefined}
        >
          <i />
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  )
}

export function BirthdayExperience() {
  const experience = useExperience()
  const [webgl, setWebgl] = useState(detectWebGL)
  const [leaving, setLeaving] = useState(false)
  const [photoIndex, setPhotoIndex] = useState<number | null>(null)
  const theme = birthdayConfig.theme
  const themeStyle = {
    '--blush': theme.blush,
    '--lavender': theme.lavender,
    '--cream': theme.cream,
    '--gold': theme.gold,
    '--sky': theme.sky,
    '--ink': theme.ink,
    '--deep': theme.deep,
    '--rose': theme.rose,
  } as CSSProperties

  const closePhoto = useCallback(() => setPhotoIndex(null), [])

  useEffect(() => {
    document.title = `${personalize(birthdayConfig.mainGreeting)}, ${displayName()}`
  }, [])

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => {
      store.reducedMotion = query.matches
      commit({ reducedMotion: query.matches })
    }
    apply()
    query.addEventListener('change', apply)
    return () => query.removeEventListener('change', apply)
  }, [])

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      store.pointerX = (event.clientX / window.innerWidth) * 2 - 1
      store.pointerY = (event.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  useEffect(() => {
    document.body.style.overflow = experience.introDone ? '' : 'hidden'
    document.body.dataset.scene = experience.section
    document.body.dataset.wish = experience.wishMade ? 'true' : 'false'
    return () => {
      document.body.style.overflow = ''
    }
  }, [experience.introDone, experience.section, experience.wishMade])

  function openSurprise() {
    if (store.opening) return
    store.opening = true
    setLeaving(true)
    if (!soundWasMuted()) void soundscape.enable(birthdayConfig.music.src)
    gsap.to(anim, {
      introZoom: 1,
      duration: store.reducedMotion ? 0.45 : 2.55,
      ease: 'power2.inOut',
      onUpdate: () => {
        store.introZoom = anim.introZoom
      },
      onComplete: () => {
        const shot = shotFor('world', store.compact)
        store.introDone = true
        store.opening = false
        store.section = 'world'
        store.camX = shot.pos[0]
        store.camY = shot.pos[1]
        store.camZ = shot.pos[2]
        store.lookX = shot.look[0]
        store.lookY = shot.look[1]
        store.lookZ = shot.look[2]
        commit({ introDone: true, section: 'world' })
      },
    })
  }

  function replay() {
    gsap.killTweensOf(anim)
    anim.introZoom = 0
    anim.wish = 0
    anim.gift = 0
    store.introZoom = 0
    store.wish = 0
    store.gift = 0
    store.giftHover = 0
    store.opening = false
    store.introDone = false
    store.section = 'intro'
    store.progress = 0
    store.sectionT = 0
    store.finale = 0
    lenisRef.current?.scrollTo(0, { immediate: true })
    window.scrollTo(0, 0)
    setLeaving(false)
    setPhotoIndex(null)
    commit({ introDone: false, section: 'intro', wishMade: false, giftOpen: false })
  }

  return (
    <div className="experience" style={themeStyle}>
      <div className="webgl-layer" aria-hidden="true">
        {webgl ? (
          <CanvasGuard onFail={() => setWebgl(false)}>
            <Suspense fallback={null}>
              <SceneCanvas />
            </Suspense>
          </CanvasGuard>
        ) : (
          <CssAtmosphere />
        )}
      </div>
      <Grain />
      <div className="vignette" />
      <div className={experience.wishMade ? 'dimmer is-on' : 'dimmer'} />
      <PointerGlow />
      <SceneManager enabled={experience.introDone} reducedMotion={experience.reducedMotion}>
        {experience.introDone ? (
          <Journey onOpenPhoto={setPhotoIndex} onReplay={replay} />
        ) : (
          <CinematicIntro reduced={experience.reducedMotion} leaving={leaving} onOpen={openSurprise} />
        )}
      </SceneManager>
      {experience.introDone ? <ProgressRail section={experience.section} /> : null}
      <AudioController />
      <PhotoModal photos={photos} index={photoIndex} onChange={setPhotoIndex} onClose={closePhoto} />
      <p className="sr-only" aria-live="polite">
        {experience.introDone
          ? `Phần: ${RAIL.find((item) => item.id === experience.section)?.label ?? 'Câu chuyện'}`
          : 'Mở đầu'}
      </p>
    </div>
  )
}
