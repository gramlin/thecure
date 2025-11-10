const cache = new Map<string, string>()

export interface AssetsAPI {
  preload: (manifest: Record<string, string>) => Promise<void>
  getTexture: (id: string) => Promise<string>
}

export const useAssets = (): AssetsAPI => {
  const preload = async (manifest: Record<string, string>) => {
    await Promise.all(
      Object.entries(manifest).map(async ([id, url]) => {
        if (!cache.has(id)) {
          await fetch(url, { cache: 'force-cache' })
          cache.set(id, url)
        }
      })
    )
  }

  const getTexture = async (id: string) => {
    if (!cache.has(id)) throw new Error(`Texture ${id} not preloaded`)
    return cache.get(id)!
  }

  return { preload, getTexture }
}
