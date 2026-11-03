import { motion } from 'framer-motion'
import { birthdayConfig, displayName, personalize } from '../config/birthday.ts'

const ease = [0.22, 1, 0.36, 1] as const

function SplitLine({ text, delay, reduced }: { text: string; delay: number; reduced: boolean }) {
  if (reduced) return <span>{text}</span>
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="split-line">
        {Array.from(text).map((character, index) => (
          <motion.span
            key={`${character}-${index}`}
            className="split-char"
            initial={{ opacity: 0, y: 22, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: delay + index * 0.032, duration: 0.7, ease }}
          >
            {character === ' ' ? '\u00A0' : character}
          </motion.span>
        ))}
      </span>
    </>
  )
}

export function CinematicIntro({
  reduced,
  leaving,
  onOpen,
}: {
  reduced: boolean
  leaving: boolean
  onOpen: () => void
}) {
  const { intro, date } = birthdayConfig
  const lineDelay = reduced ? 0.05 : intro.line1.length * 0.032 + 0.35

  return (
    <motion.section
      className="intro-screen fixed inset-0 z-[6] flex items-center justify-center px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: leaving ? 0 : 1, y: leaving ? -28 : 0 }}
      transition={{ duration: reduced ? 0.2 : leaving ? 0.7 : 1.1, ease }}
      style={{ pointerEvents: leaving ? 'none' : 'auto' }}
    >
      <div className="intro-copy">
        <motion.p
          className="eyebrow"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: leaving ? 0 : 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.8 }}
        >
          Dành cho {displayName()}
          {date ? ` · ${date}` : ''}
        </motion.p>
        <h1 className="display">
          <SplitLine text={personalize(intro.line1)} delay={0.25} reduced={reduced} />
        </h1>
        <p className="lede">
          <SplitLine text={personalize(intro.line2)} delay={lineDelay} reduced={reduced} />
        </p>
        <motion.button
          type="button"
          className="cta"
          onClick={onOpen}
          disabled={leaving}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: leaving ? 0 : 1, y: leaving ? 10 : 0 }}
          transition={{ delay: reduced ? 0.1 : lineDelay + intro.line2.length * 0.032 + 0.15, duration: 0.8, ease }}
        >
          <span>{intro.cta}</span>
        </motion.button>
      </div>
    </motion.section>
  )
}
