import { useMemo } from 'react'
import { birthdayConfig } from '../config/birthday.ts'
import { buildChapters, photos, type Chapter } from '../experience/photos.ts'
import { FloatingPhoto } from './FloatingPhoto.tsx'

function MemoryChapter({
  chapter,
  index,
  total,
  onOpen,
}: {
  chapter: Chapter
  index: number
  total: number
  onOpen: (photoIndex: number) => void
}) {
  return (
    <article className="chapter">
      <header className="chapter-header">
        {index === 0 ? (
          <>
            <p className="eyebrow">Gìn giữ</p>
            <h2 className="display">{birthdayConfig.memories.title}</h2>
            <p className="lede">{birthdayConfig.memories.subtitle}</p>
            {total > 1 ? <p className="chapter-kicker">{chapter.title}</p> : null}
          </>
        ) : (
          <>
            <p className="eyebrow">Chương {String(index + 1).padStart(2, '0')}</p>
            <h3 className="display display-sm">{chapter.title}</h3>
            <p className="lede">{chapter.subtitle}</p>
          </>
        )}
      </header>
      <div className="memory-grid">
        {chapter.cards.map((card, cardIndex) => {
          const key = card.kind === 'photo' ? card.photo.key : card.id
          return <FloatingPhoto key={key} card={card} eager={cardIndex < 6} onOpen={onOpen} />
        })}
      </div>
    </article>
  )
}

export function PhotoMemoryWorld({ onOpen }: { onOpen: (index: number) => void }) {
  const chapters = useMemo(() => buildChapters(photos), [])

  return (
    <section id="memories" data-section="memories" className="memories">
      {chapters.map((chapter, index) => (
        <MemoryChapter key={chapter.id} chapter={chapter} index={index} total={chapters.length} onOpen={onOpen} />
      ))}
    </section>
  )
}
