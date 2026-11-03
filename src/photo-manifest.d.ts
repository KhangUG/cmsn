declare module 'virtual:photo-manifest' {
  export const discoveredPhotos: Array<{
    src: string
    folder: 'cover' | 'memories' | 'special' | 'gallery'
    file: string
    key: string
  }>
}
