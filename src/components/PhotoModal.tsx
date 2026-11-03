import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import type { Photo } from '../experience/photos.ts'
import { lenisRef, useExperience } from '../experience/store.ts'

export function PhotoModal({
  photos,
  index,
  onChange,
  onClose,
}: {
  photos: Photo[]
  index: number | null
  onChange: (index: number) => void
  onClose: () => void
}) {
  const { reducedMotion } = useExperience()
  const dialog = useRef<HTMLDivElement>(null)
  const dragStart = useRef(0)
  const photo = index == null ? null : photos[index]
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [index])

  useEffect(() => {
    if (index == null) return
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null
    dialog.current?.focus()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    lenisRef.current?.stop()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (photos.length < 2) return
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        onChange((index + 1) % photos.length)
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        onChange((index - 1 + photos.length) % photos.length)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
      lenisRef.current?.start()
      previouslyFocused?.focus()
    }
  }, [index, onChange, onClose, photos.length])

  return (
    <AnimatePresence>
      {photo && index != null ? (
        <motion.div
          className="modal-root"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0.01 : 0.35 }}
          onClick={(event) => {
            if (event.target === event.currentTarget) onClose()
          }}
        >
          <div
            ref={dialog}
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-label={photo.caption || photo.alt}
            tabIndex={-1}
            onPointerDown={(event) => {
              dragStart.current = event.clientX
            }}
            onPointerUp={(event) => {
              if (photos.length < 2) return
              const delta = event.clientX - dragStart.current
              if (delta > 56) onChange((index - 1 + photos.length) % photos.length)
              if (delta < -56) onChange((index + 1) % photos.length)
            }}
          >
            <button type="button" className="modal-close" onClick={onClose} aria-label="Đóng ảnh">
              Đóng
            </button>
            {photos.length > 1 ? (
              <>
                <button
                  type="button"
                  className="modal-nav modal-prev"
                  aria-label="Ảnh trước"
                  onClick={() => onChange((index - 1 + photos.length) % photos.length)}
                >
                  Trước
                </button>
                <button
                  type="button"
                  className="modal-nav modal-next"
                  aria-label="Ảnh sau"
                  onClick={() => onChange((index + 1) % photos.length)}
                >
                  Sau
                </button>
              </>
            ) : null}
            <motion.figure
              key={photo.key}
              initial={{ opacity: 0, y: 16, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: reducedMotion ? 0.01 : 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              {failed ? (
                <div className="photo-fallback modal-fallback">
                  <span>Ảnh này chưa hiện được</span>
                  <small>Tệp không mở được</small>
                </div>
              ) : (
                <img
                  src={photo.src}
                  alt={photo.alt}
                  decoding="async"
                  onError={() => setFailed(true)}
                />
              )}
              {photos.length > 1 ? (
                <figcaption>
                  <span>
                    {index + 1} / {photos.length}
                  </span>
                </figcaption>
              ) : null}
            </motion.figure>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
