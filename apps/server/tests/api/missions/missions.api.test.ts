import { describe, expect, it } from 'bun:test'
import { resolve } from 'node:path'
import app from '@api'
import { db } from '@infra/clients/db.client'
import { nigoUserCookie } from '@tests/testSetup'

const anarchyRoadMission = new FormData()
anarchyRoadMission.append('title', 'Anarchy Road')
anarchyRoadMission.append(
  'description',
  `
Welcome to Anarchy Road.

This is a spin-off from my previous contest entry Lunar Soul. It follows two characters - Sean and Valerie, before they meet engineer James Morgan.

They are stranded in the ruins of Las Venturas and are in a midst of a conflict against a vengeful Gregory Baines, who seeks to impress his boss Malcolm Morrison and avenge his daughter's death.

Find out what happens.

  `,
)
anarchyRoadMission.append(
  'images',
  Bun.file(resolve(__dirname, '../tests/assets/Anarchy Road.webp')),
)

describe('POST /missions', () => {
  it('should create a mission', async () => {
    const res = await app.request('/missions', {
      method: 'POST',
      body: anarchyRoadMission,
      headers: {
        Cookie: nigoUserCookie,
      },
    })

    expect(res.status).toBe(204)
    expect(res.body).toBeNull()

    // Verify mission exists in the database
    const anarchyRoadMissionCount = await db.mission.count({
      where: { title: anarchyRoadMission.get('title')?.toString() ?? '' },
    })

    expect(anarchyRoadMissionCount).toBe(1)
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
      body: anarchyRoadMission,
    })

    expect(mission.status).toBe(401)
    expect(await mission.json()).toHaveProperty('issues')
  })
})
