import { discoveredPhotos } from 'virtual:photo-manifest'
import { photoMeta, type PhotoMeta } from '../config/images.ts'

export type PhotoFolder = 'cover' | 'memories' | 'special' | 'gallery'

export type Photo = {
  src: string
  folder: PhotoFolder
  file: string
  key: string
  index: number
  caption?: string
  date?: string
  alt: string
}

export type MemoryCard =
  | { kind: 'photo'; photo: Photo }
  | { kind: 'invite'; id: string; title: string; note: string }

export type Chapter = {
  id: string
  title: string
  subtitle: string
  cards: MemoryCard[]
}

const FOLDERS = new Set<PhotoFolder>(['cover', 'memories', 'special', 'gallery'])

const FOLDER_COPY: Record<PhotoFolder, { title: string; subtitle: string }> = {
  memories: { title: 'Khoảnh khắc', subtitle: 'Những ngày đáng nhớ' },
  special: { title: 'Đặc biệt', subtitle: 'Những khung hình được giữ riêng' },
  gallery: { title: 'Bộ sưu tập', subtitle: 'Thêm những kỷ niệm khác' },
  cover: { title: 'Chân dung', subtitle: 'Những khoảnh khắc của Sếp' },
}

const INVITES: Array<[string, string]> = [
  ['Ảnh sẽ ở đây', 'Thả ảnh vào public/images/memories'],
  ['Nhiều bao nhiêu cũng được', 'Hàng chục hay hàng trăm ảnh sẽ thành từng chương'],
  ['Khuôn mặt được giữ nguyên', 'Khung ảnh không cắt hình'],
  ['Muốn thêm chú thích', 'Viết trong src/config/images.ts'],
  ['Ảnh đặc biệt', 'public/images/special dùng khung vàng'],
  ['Bộ sưu tập rộng hơn', 'public/images/gallery mở thêm một chương'],
]

function lookupMeta(key: string): PhotoMeta | undefined {
  return photoMeta[key] ?? photoMeta[key.replaceAll('\\', '/')]
}

export const photos: Photo[] = discoveredPhotos
  .filter((photo): photo is typeof photo & { folder: PhotoFolder } => FOLDERS.has(photo.folder))
  .map((photo, index) => {
    const meta = lookupMeta(photo.key)
    const caption = meta?.caption?.trim() || undefined
    const date = meta?.date?.trim() || undefined
    return {
      src: photo.src,
      folder: photo.folder,
      file: photo.file,
      key: photo.key,
      index,
      caption,
      date,
      alt: meta?.alt?.trim() || caption || 'Một kỷ niệm sinh nhật',
    }
  })

export const coverPhotos = photos.filter((photo) => photo.folder === 'cover')

export function buildChapters(list: Photo[]): Chapter[] {
  const album = list.filter((photo) => photo.folder !== 'cover')

  if (album.length === 0) {
    return [
      {
        id: 'waiting',
        title: 'Ảnh của Sếp',
        subtitle: 'Bầu trời này đang chờ những tấm ảnh',
        cards: INVITES.map(([title, note], index) => ({
          kind: 'invite',
          id: `invite-${index}`,
          title,
          note,
        })),
      },
    ]
  }

  return [
    {
      id: 'memories',
      title: FOLDER_COPY.memories.title,
      subtitle: FOLDER_COPY.memories.subtitle,
      cards: album.map((photo) => ({ kind: 'photo', photo })),
    },
  ]
}

export type Slot = {
  x: number
  y: number
  z: number
  rot: number
  delay: number
  duration: number
}

const CLOUD: Array<Pick<Slot, 'x' | 'y' | 'z' | 'rot'>> = [
  { x: 22, y: 68, z: 30, rot: -7 },
  { x: 40, y: 56, z: 86, rot: 4 },
  { x: 62, y: 64, z: 18, rot: 3 },
  { x: 80, y: 54, z: -24, rot: -5 },
  { x: 30, y: 82, z: -8, rot: 6 },
  { x: 58, y: 80, z: 48, rot: -3 },
  { x: 48, y: 50, z: -46, rot: 2 },
  { x: 84, y: 74, z: 8, rot: 5 },
]

const PRESETS: Record<number, Array<Pick<Slot, 'x' | 'y' | 'z' | 'rot'>>> = {
  1: [{ x: 50, y: 66, z: 70, rot: -3 }],
  2: [
    { x: 34, y: 64, z: 36, rot: -6 },
    { x: 68, y: 60, z: 78, rot: 5 },
  ],
  3: [
    { x: 26, y: 70, z: 24, rot: -7 },
    { x: 50, y: 56, z: 84, rot: 2 },
    { x: 74, y: 72, z: 16, rot: 6 },
  ],
  4: [
    { x: 26, y: 58, z: 54, rot: -6 },
    { x: 72, y: 56, z: 16, rot: 5 },
    { x: 32, y: 78, z: 4, rot: 4 },
    { x: 70, y: 78, z: 64, rot: -3 },
  ],
}

export function layoutFor(count: number, mobile: boolean): Slot[] {
  const base = PRESETS[count] ?? CLOUD.slice(0, Math.max(count, 0))
  return base.slice(0, count).map((slot, index) => ({
    x: mobile ? 50 + (slot.x - 50) * 0.58 : slot.x,
    y: mobile ? 56 + (slot.y - 54) * 0.62 : slot.y,
    z: mobile ? slot.z * 0.28 : slot.z,
    rot: mobile ? slot.rot * 0.45 : slot.rot,
    delay: (index % 6) * 0.28,
    duration: 6.6 + (index % 4) * 0.85,
  }))
}
