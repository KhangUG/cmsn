import { AnimatePresence, motion } from 'framer-motion'
import { birthdayConfig } from '../config/birthday.ts'
import { soundscape } from '../experience/audio.ts'
import { gsap } from '../experience/gsap.ts'
import { anim, commit, store, useExperience } from '../experience/store.ts'

export function GiftSection() {
  const { giftOpen, reducedMotion } = useExperience()

  function openGift() {
    if (anim.gift > 0.02 || store.opening) return
    commit({ giftOpen: true })
    soundscape.sparkle()
    gsap.to(anim, {
      gift: 1,
      duration: reducedMotion ? 0.35 : 1.65,
      ease: 'power3.inOut',
      onUpdate: () => {
        store.gift = anim.gift
      },
      onComplete: () => {
        soundscape.chime()
      },
    })
  }

  return (
    <section id="gift" data-section="gift" className="scene gift-scene">
      <div className="scene-copy scene-copy-top">
        <AnimatePresence mode="wait">
          {giftOpen ? (
            <motion.div
              key="opened"
              className="gift-card"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reducedMotion ? 0.01 : 0.7, delay: reducedMotion ? 0 : 0.35 }}
            >
              {birthdayConfig.gift.messages.map((message) => (
                <p key={message}>{message}</p>
              ))}
            </motion.div>
          ) : (
            <motion.div key="closed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="eyebrow">{birthdayConfig.gift.eyebrow}</p>
              <h2 className="display display-sm">{birthdayConfig.gift.title}</h2>
              <p className="lede">{birthdayConfig.gift.hint}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {giftOpen ? null : (
        <button
          type="button"
          className="gift-trigger"
          aria-label={birthdayConfig.gift.openLabel}
          onMouseEnter={() => {
            store.giftHover = 1
          }}
          onMouseLeave={() => {
            store.giftHover = 0
          }}
          onFocus={() => {
            store.giftHover = 1
          }}
          onBlur={() => {
            store.giftHover = 0
          }}
          onClick={openGift}
        >
          <span>{birthdayConfig.gift.openLabel}</span>
        </button>
      )}
    </section>
  )
}
