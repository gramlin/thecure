import { describe, expect, it } from 'vitest'
import { __sequencerTest } from '~/app/composables/useSequencer'
import type { Keyframe } from '~/types/timeline'

describe('timeline sampling', () => {
  it('interpolates numeric values', () => {
    const frames: Keyframe<number>[] = [
      { t: 0, v: 0 },
      { t: 1000, v: 100 }
    ]
    expect(__sequencerTest.sampleTrack(frames, 500)).toBeCloseTo(50)
  })

  it('interpolates colors', () => {
    const frames: Keyframe<string>[] = [
      { t: 0, v: '#000000' },
      { t: 1000, v: '#ffffff' }
    ]
    expect(__sequencerTest.sampleTrack(frames, 1000)).toBe('#ffffff')
  })
})

