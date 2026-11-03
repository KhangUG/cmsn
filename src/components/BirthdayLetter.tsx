import { useLayoutEffect, useRef } from 'react'
import { birthdayConfig, personalize } from '../config/birthday.ts'
import { gsap } from '../experience/gsap.ts'
import { useExperience } from '../experience/store.ts'

function Corner() {
  return (
    <svg className="card-corner" viewBox="0 0 72 72" aria-hidden="true">
      <path d="M8 40c14-2 22-12 24-28" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M8 52c18 0 30-12 34-32" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="30" cy="16" r="3.2" fill="currentColor" />
      <circle cx="18" cy="28" r="2.2" fill="currentColor" opacity="0.7" />
      <circle cx="40" cy="30" r="2" fill="currentColor" opacity="0.55" />
    </svg>
  )
}

export function BirthdayLetter() {
  const { reducedMotion, section } = useExperience()
  const root = useRef<HTMLElement>(null)
  const card = useRef<HTMLElement>(null)
  const { letter } = birthdayConfig

  function renderInline(text: string) {
    return text.split('**').map((part, index) =>
      index % 2 === 1 ? <strong key={index}>{personalize(part)}</strong> : <span key={index}>{personalize(part)}</span>,
    )
  }

  function renderBlock(text: string) {
    return text.split('\n').map((line, index) => (
      <span key={line}>
        {index > 0 ? <br /> : null}
        {renderInline(line)}
      </span>
    ))
  }

  useLayoutEffect(() => {
    const scope = root.current
    const cardEl = card.current
    if (!scope || !cardEl || reducedMotion || section !== 'letter') return

    const context = gsap.context(() => {
      const lines = scope.querySelectorAll('[data-line]')
      gsap.set(cardEl, { y: 24, opacity: 0 })
      gsap.set(lines, { y: 14, opacity: 0 })
      gsap
        .timeline()
        .to(cardEl, { y: 0, opacity: 1, duration: 0.9, ease: 'power2.out' })
        .to(lines, { y: 0, opacity: 1, stagger: 0.08, duration: 0.55, ease: 'power2.out' }, '-=0.35')
    }, scope)

    return () => context.revert()
  }, [reducedMotion, section])

  return (
    <section id="letter" data-section="letter" className="scene letter-scene" ref={root}>
      <article className="greeting-card" ref={card}>
        <Corner />
        <Corner />
        <Corner />
        <Corner />
        <p className="card-kicker" data-line>
          {personalize(letter.eyebrow)}
        </p>
        <h2 className="card-title" data-line>
          {personalize(letter.salutation)}
        </h2>
        <div className="card-rule" aria-hidden="true">
          <span />
          <i>✦</i>
          <span />
        </div>
        {letter.paragraphs.map((paragraph) => (
          <p key={paragraph} className={paragraph.includes('**') ? 'card-verse' : undefined} data-line>
            {renderBlock(paragraph)}
          </p>
        ))}
        <div className="card-close" data-line>
          <p className="signature">{personalize(letter.signature)}</p>
          <p className="letter-from">{personalize(letter.from)}</p>
        </div>
      </article>
    </section>
  )
}
