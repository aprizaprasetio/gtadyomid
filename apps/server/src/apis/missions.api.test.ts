import { describe, expect, it } from 'bun:test'
import type { z } from 'zod'
import app from '@src/.'
import { db } from '@src/clients/db.client'
import { nigoUserCookie } from '@src/../testSetup'
import type { missionSchema } from './missions.api'

const newMission: z.infer<typeof missionSchema> = {
  title: 'Mission Title',
  description: 'Mission Description',
}

describe('POST /missions', () => {
  it('should create a mission', async () => {
    const res = await app.request('/missions', {
      method: 'POST',
      body: new URLSearchParams(newMission),
      headers: {
        Cookie: nigoUserCookie,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })

    expect(res.status).toBe(204)
    expect(res.body).toBeNull()

    // Verify mission exists in the database
    const newMissionCount = await db.mission.count({
      where: { title: newMission.title },
    })

    expect(newMissionCount).toBe(1)
  })

  it('should not create a mission with missing form datas', async () => {
    const mission = await app.request('/missions', {
      method: 'POST',
      headers: {
        Cookie: nigoUserCookie,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })

    expect(mission.status).toBe(400)
    expect(await mission.json()).toHaveProperty('issues')
  })

  it('should not create a mission with unauthenticated cookie', async () => {
    const mission = await app.request('/missions', {
      method: 'POST',
      body: new URLSearchParams(newMission),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })

    expect(mission.status).toBe(401)
    expect(await mission.json()).toHaveProperty('issues')
  })
})
