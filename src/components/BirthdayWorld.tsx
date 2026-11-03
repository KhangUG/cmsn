import { motion } from 'framer-motion'
import { birthdayConfig, personalize } from '../config/birthday.ts'
import { coverPhotos } from '../experience/photos.ts'
import { useExperience } from '../experience/store.ts'

export function BirthdayWorld() {
  const { reducedMotion } = useExperience()
  const duration = reducedMotion ? 0.01 : 1

  return (
    <section id="world" data-section="world" className="scene world-scene">
      <motion.div
        className="scene-copy"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration, delay: reducedMotion ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="eyebrow">{birthdayConfig.world.eyebrow}</p>
        <h1 className="display">
          {personalize(birthdayConfig.world.message).split(personalize('{name}')).map((part, index, parts) => (
            <span key={index}>
              {part}
              {index < parts.length - 1 ? <span className="name-shine">{personalize('{name}')}</span> : null}
            </span>
          ))}
        </h1>
        <p className="lede">{birthdayConfig.world.subline}</p>
      </motion.div>

      {coverPhotos.length > 0 ? (
        <div className="cover-stack">
          {coverPhotos.slice(0, 2).map((photo, index) => (
            <figure key={photo.key} className="cover-frame" style={{ rotate: `${index === 0 ? -6 : 5}deg` }}>
              <img src={photo.src} alt={photo.alt} />
            </figure>
          ))}
        </div>
      ) : null}

      <div className="scroll-cue" aria-hidden="true">
        <span>Kéo xuống để xem tiếp</span>
        <i className="scroll-line" />
      </div>
    </section>
  )
}
