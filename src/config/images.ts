/**
 * Captions for your photographs.
 *
 * 1. Drop images into:
 *      public/images/cover/      a portrait featured beside the greeting
 *      public/images/memories/   the floating memory chapters
 *      public/images/special/    gold-framed favorites
 *      public/images/gallery/    extra chapters when the album grows
 * 2. Restart is not required in dev — new files are picked up automatically.
 * 3. Add an optional caption here. The key is the folder plus filename.
 *
 * Photos keep their full frame, so faces are not cropped.
 * You can add dozens or hundreds of images; they are grouped into chapters
 * and only the nearby chapter is loaded.
 *
 * Example:
 * export const photoMeta = {
 *   "memories/beach-day.jpg": {
 *     caption: "The afternoon we forgot to go home",
 *     date: "June 2024",
 *   },
 *   "special/portrait.png": {
 *     caption: "This one, especially",
 *     date: "Your day",
 *   },
 * }
 */

export type PhotoMeta = {
  caption?: string
  date?: string
  alt?: string
}

export const photoMeta: Record<string, PhotoMeta> = {
  'cover/hoi-thao.jpg': { alt: 'Ảnh chân dung trong hành lang hội thảo' },
  'special/ao-chanh.jpg': { alt: 'Ảnh dạo phố với áo họa tiết chanh' },
  'memories/ca-nha.jpg': { alt: 'Ảnh cả nhóm chụp tại buổi tiệc' },
  'memories/san-khau.jpg': { alt: 'Ảnh đứng cùng mọi người trên sân khấu' },
  'memories/loi-chuc.jpg': { alt: 'Ảnh trên sân khấu bên micro' },
  'memories/dong-doi.jpg': { alt: 'Ảnh nhóm tại hội nghị' },
  'memories/lop-hoc.jpg': { alt: 'Ảnh trong buổi thực hành' },
}
