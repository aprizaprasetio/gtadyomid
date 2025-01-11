import { describe, expect, it } from 'bun:test'
import { resolve } from 'node:path'
import app from '@src/.'
import { db } from '@src/clients/db.client'
import { nigoUserCookie } from '@src/../testSetup'

const anarchyRoad = Bun.file(
  resolve(__dirname, '../tests/assets/Anarchy Road.webp'),
)
const newMission = new FormData()
newMission.append('title', 'Mission Title')
newMission.append('description', 'Mission Description')
newMission.append('images', anarchyRoad)

describe('POST /missions', () => {
  it('should create a mission', async () => {
    const res = await app.request('/missions', {
      method: 'POST',
      body: newMission,
      headers: {
        Cookie: nigoUserCookie,
      },
    })

    expect(res.status).toBe(204)
    expect(res.body).toBeNull()

    // Verify mission exists in the database
    const newMissionCount = await db.mission.count({
      where: { title: newMission.get('title')?.toString() ?? '' },
    })

    expect(newMissionCount).toBe(1)
  })

  it('should not create a mission with missing form datas', async () => {
    const mission = await app.request('/missions', {
      method: 'POST',
      headers: {
        Cookie: nigoUserCookie,
      },
    })

    expect(mission.status).toBe(400)
    expect(await mission.json()).toHaveProperty('issues')
  })

  it('should not create a mission with unauthenticated cookie', async () => {
    const mission = await app.request('/missions', {
      method: 'POST',
      body: newMission,
    })

    expect(mission.status).toBe(401)
    expect(await mission.json()).toHaveProperty('issues')
  })
})
