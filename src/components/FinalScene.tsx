import { motion } from 'framer-motion'
import { birthdayConfig, personalize } from '../config/birthday.ts'
import { photos } from '../experience/photos.ts'
import { useExperience } from '../experience/store.ts'

export function FinalScene({ onReplay }: { onReplay: () => void }) {
  const { reducedMotion } = useExperience()
  const floating = photos.slice(0, 6)

  return (
    <section id="finale" data-section="finale" className="scene finale-scene">
      {floating.map((photo, index) => (
        <img
          key={photo.key}
          className={`finale-memory memory-${index}`}
          src={photo.src}
          alt=""
          loading="lazy"
          decoding="async"
        />
      ))}
      <motion.div
        className="finale-copy"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: reducedMotion ? 0.01 : 1.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="eyebrow">{birthdayConfig.mainGreeting}</p>
        <h2 className="display">{personalize(birthdayConfig.finale.line1)}</h2>
        <p className="lede finale-line">{personalize(birthdayConfig.finale.line2)}</p>
        <button type="button" className="cta cta-ghost" onClick={onReplay}>
          <span>{birthdayConfig.finale.replay}</span>
        </button>
      </motion.div>
    </section>
  )
}
