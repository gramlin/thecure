/**
 * Enkel in-memory-cache av manifest-resurser. Nyckeln är manifest-id och värdet är URL:en.
 */
const cache = new Map<string, string>()

export interface AssetsAPI {
  preload: (manifest: Record<string, string>) => Promise<void>
  getTexture: (id: string) => Promise<string>
}

/**
 * Composable som hanterar preload av scen-assets och ger tillgång till texturer.
 */
export const useAssets = (): AssetsAPI => {
  /**
   * Förladdar ett manifest av id→URL genom att fetcha och cacha värdena.
   */
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

  /**
   * Returnerar URL:en för en tidigare förladdad textur.
   */
  const getTexture = async (id: string) => {
    if (!cache.has(id)) throw new Error(`Texture ${id} not preloaded`)
    return cache.get(id)!
  }

  return { preload, getTexture }
}
