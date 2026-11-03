import { BirthdayLetter } from './BirthdayLetter.tsx'
import { BirthdayWorld } from './BirthdayWorld.tsx'
import { FinalScene } from './FinalScene.tsx'
import { PhotoMemoryWorld } from './PhotoMemoryWorld.tsx'

export function Journey({
  onOpenPhoto,
  onReplay,
}: {
  onOpenPhoto: (index: number) => void
  onReplay: () => void
}) {
  return (
    <main id="journey">
      <BirthdayWorld />
      <PhotoMemoryWorld onOpen={onOpenPhoto} />
      <BirthdayLetter />
      <FinalScene onReplay={onReplay} />
    </main>
  )
}
