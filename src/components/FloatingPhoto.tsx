import { useState } from 'react'
import type { MemoryCard } from '../experience/photos.ts'

function FramedImage({ src, alt, eager }: { src: string; alt: string; eager: boolean }) {
  const [failed, setFailed] = useState(false)
  const [ready, setReady] = useState(false)

  if (failed) {
    return (
      <span className="photo-fallback">
        <span>Ảnh này chưa hiện được</span>
        <small>Tệp không mở được</small>
      </span>
    )
  }

  return (
    <span className={ready ? 'frame-window is-ready' : 'frame-window'}>
      <img
        src={src}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        draggable={false}
        onLoad={() => setReady(true)}
        onError={() => setFailed(true)}
      />
    </span>
  )
}

export function FloatingPhoto({
  card,
  eager,
  onOpen,
}: {
  card: MemoryCard
  eager: boolean
  onOpen: (index: number) => void
}) {
  if (card.kind === 'invite') {
    return (
      <div className="photo-slot">
        <article className="invite-card">
          <p>{card.title}</p>
          <small>{card.note}</small>
        </article>
      </div>
    )
  }

  const { photo } = card

  return (
    <button type="button" className="photo-slot polaroid" onClick={() => onOpen(photo.index)}>
      <span className="frame-mat">
        <FramedImage src={photo.src} alt={photo.alt} eager={eager} />
      </span>
    </button>
  )
}
