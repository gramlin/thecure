/**
 * Predicate som beskriver en stoladress i arenan.
 */
export interface SeatPredicate {
  section?: string
  row?: { gte?: number; lte?: number }
  id?: string
}

/**
 * Address Expression (AE) beskriver vilka klienter som ska matcha ett kommando.
 * DSL:en stödjer logiska noder (`any`/`all`/`not`) samt riktning mot säte, zon,
 * party, ticket och capabilities.
 */
export type AddressExpression =
  | { any?: AddressExpression[] | AddressExpression }
  | { all?: AddressExpression[] | AddressExpression }
  | { not?: AddressExpression[] | AddressExpression }
  | { seat?: SeatPredicate }
  | { zone?: string | string[] }
  | { party?: string }
  | { ticket?: string | { min?: number } }
  | { capability?: { webgl?: boolean } }

export interface ClientContext {
  seatId?: string
  section?: string
  row?: number
  zone?: string
  partyIds?: string[]
  tickets?: { ids: string[]; count: number }
  capabilities?: { webgl?: boolean }
}

const normalize = (value?: AddressExpression[] | AddressExpression): AddressExpression[] => {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

/**
 * Avgör om en stolpredikat matchar klientens kontext.
 */
const matchesSeat = (ctx: ClientContext, pred: SeatPredicate) => {
  if (pred.section && pred.section !== ctx.section) return false
  if (pred.id && pred.id !== ctx.seatId) return false
  if (pred.row) {
    if (pred.row.gte !== undefined && (ctx.row ?? -Infinity) < pred.row.gte) return false
    if (pred.row.lte !== undefined && (ctx.row ?? Infinity) > pred.row.lte) return false
  }
  return true
}

/**
 * Returnerar `true` om klientkontexten uppfyller angiven Address Expression.
 * Matchningen sker rekursivt och stöder kombinationer av logiska noder.
 */
export const matchesAE = (ctx: ClientContext, ae?: AddressExpression): boolean => {
  if (!ae) return true
  if ('any' in ae) {
    const list = normalize(ae.any)
    return list.some((child) => matchesAE(ctx, child))
  }
  if ('all' in ae) {
    const list = normalize(ae.all)
    return list.every((child) => matchesAE(ctx, child))
  }
  if ('not' in ae) {
    const list = normalize(ae.not)
    return !list.some((child) => matchesAE(ctx, child))
  }
  if ('seat' in ae) {
    return matchesSeat(ctx, ae.seat!)
  }
  if ('zone' in ae) {
    const zones = Array.isArray(ae.zone) ? ae.zone : [ae.zone]
    return zones.includes(ctx.zone ?? '')
  }
  if ('party' in ae) {
    return ctx.partyIds?.includes(ae.party!) ?? false
  }
  if ('ticket' in ae) {
    if (typeof ae.ticket === 'string') {
      return ctx.tickets?.ids.includes(ae.ticket) ?? false
    }
    if (typeof ae.ticket === 'object') {
      const min = ae.ticket.min ?? 1
      return (ctx.tickets?.count ?? 0) >= min
    }
  }
  if ('capability' in ae) {
    const cap = ae.capability
    if (cap?.webgl !== undefined) {
      return Boolean(ctx.capabilities?.webgl) === cap.webgl
    }
  }
  return false
}

/**
 * Composable som exponerar adressmatchningshjälpare.
 */
export const useAddressing = () => ({ matchesAE })
