import { useEffect, useRef } from 'react'
import { store, useExperience } from '../experience/store.ts'

const BALLOONS = [
  { left: '12%', delay: '0s', color: '#f3b4c8', size: 74 },
  { left: '28%', delay: '-2s', color: '#d9c8fb', size: 48 },
  { left: '70%', delay: '-1s', color: '#f6e1a6', size: 86 },
  { left: '84%', delay: '-3s', color: '#b9d8f6', size: 54 },
]

export function CssAtmosphere() {
  const { section, wishMade, giftOpen } = useExperience()
  const flame = useRef<HTMLDivElement>(null)
  const lid = useRef<HTMLDivElement>(null)
  const showCake = section === 'intro' || section === 'world' || section === 'cake' || section === 'finale'
  const showGift = section === 'gift'

  useEffect(() => {
    let frame = 0
    const loop = () => {
      if (flame.current) flame.current.style.opacity = String(Math.max(0, 1 - store.wish))
      if (lid.current) lid.current.style.transform = `rotateX(${-store.gift * 118}deg)`
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div className="css-sky" aria-hidden="true">
      <div className="css-orb" />
      {BALLOONS.map((balloon) => (
        <span
          key={balloon.left}
          className="css-balloon"
          style={{
            left: balloon.left,
            animationDelay: balloon.delay,
            background: balloon.color,
            width: balloon.size,
            height: balloon.size * 1.2,
          }}
        />
      ))}
      {showCake ? (
        <div className={`css-cake ${wishMade ? 'is-wished' : ''}`}>
          <div className="tier tier-a" />
          <div className="tier tier-b" />
          <div className="tier tier-c" />
          <div ref={flame} className="css-flames">
            <i />
            <i />
            <i />
          </div>
        </div>
      ) : null}
      {showGift ? (
        <div className={`css-gift ${giftOpen ? 'is-open' : ''}`}>
          <div ref={lid} className="css-lid" />
          <div className="css-box" />
        </div>
      ) : null}
    </div>
  )
}
