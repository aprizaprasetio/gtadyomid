import { createMission } from '@app/missions/commands/createMission/createMission.command'
import { Hono } from 'hono'

export const missions = new Hono()

missions.post('/', ...createMission)
