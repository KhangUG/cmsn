import { AnimatePresence, motion } from 'framer-motion'
import { birthdayConfig } from '../config/birthday.ts'
import { soundscape } from '../experience/audio.ts'
import { gsap } from '../experience/gsap.ts'
import { anim, commit, store, useExperience } from '../experience/store.ts'

export function CakeSection() {
  const { wishMade, reducedMotion } = useExperience()

  function makeWish() {
    if (anim.wish > 0.02) return
    commit({ wishMade: true })
    gsap.to(anim, {
      wish: 1,
      duration: reducedMotion ? 0.4 : 1.9,
      ease: 'power2.in',
      onUpdate: () => {
        store.wish = anim.wish
      },
      onComplete: () => {
        store.burstToken += 1
        soundscape.whoosh()
        gsap.delayedCall(0.18, () => soundscape.chime())
      },
    })
  }

  return (
    <section id="cake" data-section="cake" className="scene cake-scene">
      <div className="scene-copy scene-copy-top">
        <p className="eyebrow">{birthdayConfig.cake.eyebrow}</p>
        <h2 className="display display-sm">{wishMade ? birthdayConfig.cake.prompt : birthdayConfig.cake.title}</h2>
      </div>
      <div className="scene-action">
        <AnimatePresence mode="wait">
          {wishMade ? (
            <motion.p
              key="wish"
              className="wish-message"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reducedMotion ? 0.01 : 1.1, delay: reducedMotion ? 0 : 1.15, ease: [0.22, 1, 0.36, 1] }}
            >
              {birthdayConfig.cake.message}
            </motion.p>
          ) : (
            <motion.button
              key="prompt"
              type="button"
              className="cta"
              onClick={makeWish}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <span>{birthdayConfig.cake.prompt}</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
