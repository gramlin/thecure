import { describe, expect, it } from 'vitest'
import { matchesAE, type ClientContext } from '~/app/composables/useAddressing'

const context: ClientContext = {
  seatId: 'A12',
  section: 'A',
  row: 4,
  zone: 'north',
  partyIds: ['party-1'],
  tickets: { ids: ['gold-1'], count: 2 },
  capabilities: { webgl: true }
}

describe('matchesAE', () => {
  it('matches simple seat', () => {
    expect(matchesAE(context, { seat: { section: 'A', row: { gte: 1, lte: 10 } } })).toBe(true)
  })

  it('rejects different party', () => {
    expect(matchesAE(context, { party: 'party-2' })).toBe(false)
  })

  it('matches ticket count', () => {
    expect(matchesAE(context, { ticket: { min: 2 } })).toBe(true)
  })

  it('handles nested any/all', () => {
    expect(
      matchesAE(context, {
        all: [
          { seat: { section: 'A' } },
          { any: [{ party: 'party-1' }, { ticket: 'gold-1' }] }
        ]
      })
    ).toBe(true)
  })
})

