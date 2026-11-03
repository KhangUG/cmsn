import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { defineConfig, type Plugin } from 'vite'

const IMAGE_FOLDERS = ['cover', 'memories', 'special', 'gallery'] as const
const IMAGE_PATTERN = /\.(jpe?g|png|webp|gif|avif)$/i

type DiscoveredPhoto = {
  src: string
  folder: (typeof IMAGE_FOLDERS)[number]
  file: string
  key: string
}

function discoverPhotos(root: string): DiscoveredPhoto[] {
  const photos: DiscoveredPhoto[] = []

  for (const folder of IMAGE_FOLDERS) {
    const dir = path.join(root, folder)
    if (!fs.existsSync(dir)) continue

    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isFile() || !IMAGE_PATTERN.test(entry.name)) continue
      photos.push({
        src: `/images/${folder}/${encodeURIComponent(entry.name)}`,
        folder,
        file: entry.name,
        key: `${folder}/${entry.name}`,
      })
    }
  }

  photos.sort((a, b) => a.key.localeCompare(b.key, undefined, { numeric: true, sensitivity: 'base' }))
  return photos
}

function photoManifest(): Plugin {
  const virtualId = 'virtual:photo-manifest'
  const resolvedId = `\0${virtualId}`

  const loadPhotos = () => {
    const root = path.resolve(process.cwd(), 'public/images')
    return { root, photos: discoverPhotos(root) }
  }

  return {
    name: 'photo-manifest',
    resolveId(id) {
      if (id === virtualId) return resolvedId
      return null
    },
    load(id) {
      if (id !== resolvedId) return null
      const { photos } = loadPhotos()
      return `export const discoveredPhotos = ${JSON.stringify(photos)}\n`
    },
    configureServer(server) {
      const imagesRoot = path.resolve(process.cwd(), 'public/images')
      server.watcher.add(imagesRoot)
      const reload = (file: string) => {
        const normalized = file.split(path.sep).join('/')
        if (!normalized.includes('/public/images/')) return
        const mod = server.moduleGraph.getModuleById(resolvedId)
        if (mod) server.moduleGraph.invalidateModule(mod)
        server.ws.send({ type: 'full-reload' })
      }
      server.watcher.on('add', reload)
      server.watcher.on('unlink', reload)
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), photoManifest()],
  server: {
    watch: {
      ignored: ['**/.chrome-tmp/**', '**/shot-*.png'],
    },
  },
})
