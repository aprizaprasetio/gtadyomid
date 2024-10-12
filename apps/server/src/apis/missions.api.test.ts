import { describe, expect, it } from 'bun:test'
import type { z } from 'zod'
import app from '@src/.'
import { nigoUserCookie } from '@src/../testSetup'
import type { missionSchema } from './missions.api'

const newMission: z.infer<typeof missionSchema> = {
  title: 'Mission Title',
  description: 'Mission Description',
}

describe('POST /missions', () => {
  it('should create mission', async () => {
    const mission = await app.request('/missions', {
      method: 'POST',
      body: new URLSearchParams(newMission),
      headers: {
        Cookie: nigoUserCookie,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })

    expect(mission.status).toBe(204)
    expect(mission.body).toBeNull()
  })
})
