import { prisma } from '../prisma'
import { pubsub, ROOMS_UPDATED } from './pubsub'
import { RoomStatus, ActionType } from '@prisma/client'

export const resolvers = {
  // Custom type resolvers to ensure proper date serialization
  Room: {
    occupiedSince: (parent: any) => parent.occupiedSince?.toISOString() || null,
    reservedUntil: (parent: any) => parent.reservedUntil?.toISOString() || null,
    updatedAt: (parent: any) => parent.updatedAt?.toISOString() || null,
  },
  Team: {
    createdAt: (parent: any) => parent.createdAt?.toISOString() || null,
  },
  History: {
    timestamp: (parent: any) => parent.timestamp?.toISOString() || null,
    archivedDate: (parent: any) => parent.archivedDate?.toISOString() || null,
  },
  DailyStats: {
    date: (parent: any) => parent.date?.toISOString() || null,
    teamActivity: (parent: any) => JSON.stringify(parent.teamActivity)
  },

  Query: {
    rooms: async () => {
      return await prisma.room.findMany({
        include: { currentTeam: true },
        orderBy: { name: 'asc' }
      })
    },

    teams: async () => {
      return await prisma.team.findMany({
        where: { isArchived: false },
        orderBy: { createdAt: 'desc' }
      })
    },

    history: async (_: any, { filter }: any) => {
      const where: any = { archivedDate: null }

      if (filter?.teamId) where.teamId = filter.teamId
      if (filter?.roomId) where.roomId = filter.roomId
      if (filter?.action) where.action = filter.action

      return await prisma.history.findMany({
        where,
        include: { room: true, team: true },
        orderBy: { timestamp: 'desc' },
        take: 100
      })
    },

    dailyStats: async (_: any, { date }: any) => {
      if (!date) return null
      return await prisma.dailyStats.findUnique({
        where: { date: new Date(date) }
      })
    },

    currentStats: async () => {
      const rooms = await prisma.room.findMany()
      const teams = await prisma.team.findMany({ where: { isArchived: false } })

      return {
        occupiedCount: rooms.filter(r => r.status === 'OCCUPIED').length,
        reservedCount: rooms.filter(r => r.status === 'RESERVED').length,
        totalRooms: rooms.length,
        activeTeams: teams.length
      }
    }
  },

  Mutation: {
    createTeam: async (_: any, { name, color }: any) => {
      // Check if team name already exists
      const existing = await prisma.team.findUnique({ where: { name } })
      if (existing) {
        throw new Error('Skupina s tímto názvem již existuje')
      }

      // Validate hex color
      if (!/^#[0-9A-F]{6}$/i.test(color)) {
        throw new Error('Neplatný formát barvy (použijte #RRGGBB)')
      }

      return await prisma.team.create({
        data: { name, color }
      })
    },

    occupyRoom: async (_: any, { roomId, teamId }: any) => {
      const room = await prisma.room.findUnique({ where: { id: roomId } })
      const team = await prisma.team.findUnique({ where: { id: teamId } })

      if (!room || !team) {
        throw new Error('Místnost nebo skupina nebyl nalezen')
      }

      if (room.status !== RoomStatus.FREE) {
        throw new Error('Místnost není volná')
      }

      // Check if team already has an OCCUPIED room (allow max 1 occupied room)
      // Note: We allow having a reservation AND an occupied room simultaneously as per requirements
      const activeOccupation = await prisma.room.findFirst({
        where: {
          currentTeamId: teamId,
          status: RoomStatus.OCCUPIED
        }
      })

      if (activeOccupation) {
        throw new Error('Skupina již obsadila jinou místnost (max 1)')
      }

      // Update room
      const updatedRoom = await prisma.room.update({
        where: { id: roomId },
        data: {
          status: RoomStatus.OCCUPIED,
          currentTeamId: teamId,
          occupiedSince: new Date()
        },
        include: { currentTeam: true }
      })

      // Create history record
      await prisma.history.create({
        data: {
          roomId,
          teamId,
          action: ActionType.OCCUPY,
          previousStatus: RoomStatus.FREE,
          newStatus: RoomStatus.OCCUPIED
        }
      })

      // Publish update
      const allRooms = await prisma.room.findMany({ include: { currentTeam: true } })
      pubsub.publish(ROOMS_UPDATED, { roomsUpdated: allRooms })

      return updatedRoom
    },

    reserveRoom: async (_: any, { roomId, teamId }: any) => {
      const room = await prisma.room.findUnique({ where: { id: roomId } })
      const team = await prisma.team.findUnique({ where: { id: teamId } })

      if (!room || !team) {
        throw new Error('Místnost nebo skupina nebyl nalezen')
      }

      if (room.status !== RoomStatus.FREE) {
        throw new Error('Místnost není volná')
      }

      // Check if team already has a reservation
      const existingReservation = await prisma.room.findFirst({
        where: {
          currentTeamId: teamId,
          status: RoomStatus.RESERVED
        }
      })

      if (existingReservation) {
        throw new Error('Skupina může mít pouze jednu aktivní rezervaci')
      }

      // Reserve for 5 minutes
      const reservedUntil = new Date(Date.now() + 5 * 60 * 1000)

      const updatedRoom = await prisma.room.update({
        where: { id: roomId },
        data: {
          status: RoomStatus.RESERVED,
          currentTeamId: teamId,
          reservedUntil
        },
        include: { currentTeam: true }
      })

      await prisma.history.create({
        data: {
          roomId,
          teamId,
          action: ActionType.RESERVE,
          previousStatus: RoomStatus.FREE,
          newStatus: RoomStatus.RESERVED
        }
      })

      const allRooms = await prisma.room.findMany({ include: { currentTeam: true } })
      pubsub.publish(ROOMS_UPDATED, { roomsUpdated: allRooms })

      return updatedRoom
    },

    freeRoom: async (_: any, { roomId, teamId }: any) => {
      const room = await prisma.room.findUnique({ where: { id: roomId } })

      if (!room) {
        throw new Error('Místnost nebyla nalezena')
      }

      if (room.currentTeamId !== teamId) {
        throw new Error('Pouze vlastník může uvolnit místnost')
      }

      if (room.status !== RoomStatus.OCCUPIED && room.status !== RoomStatus.RESERVED) {
        throw new Error('Místnost není obsazená ani rezervovaná')
      }

      const previousStatus = room.status

      const updatedRoom = await prisma.room.update({
        where: { id: roomId },
        data: {
          status: RoomStatus.FREE,
          currentTeamId: null,
          occupiedSince: null,
          reservedUntil: null
        },
        include: { currentTeam: true }
      })

      await prisma.history.create({
        data: {
          roomId,
          teamId,
          action: ActionType.FREE,
          previousStatus,
          newStatus: RoomStatus.FREE
        }
      })

      const allRooms = await prisma.room.findMany({ include: { currentTeam: true } })
      pubsub.publish(ROOMS_UPDATED, { roomsUpdated: allRooms })

      return updatedRoom
    },

    cancelReservation: async (_: any, { roomId, teamId }: any) => {
      const room = await prisma.room.findUnique({ where: { id: roomId } })

      if (!room) {
        throw new Error('Místnost nebyla nalezena')
      }

      if (room.currentTeamId !== teamId) {
        throw new Error('Pouze vlastník může zrušit rezervaci')
      }

      if (room.status !== RoomStatus.RESERVED) {
        throw new Error('Místnost není rezervovaná')
      }

      const updatedRoom = await prisma.room.update({
        where: { id: roomId },
        data: {
          status: RoomStatus.FREE,
          currentTeamId: null,
          reservedUntil: null
        },
        include: { currentTeam: true }
      })

      await prisma.history.create({
        data: {
          roomId,
          teamId,
          action: ActionType.CANCEL_RESERVATION,
          previousStatus: RoomStatus.RESERVED,
          newStatus: RoomStatus.FREE
        }
      })

      const allRooms = await prisma.room.findMany({ include: { currentTeam: true } })
      pubsub.publish(ROOMS_UPDATED, { roomsUpdated: allRooms })

      return updatedRoom
    },

    adminSetRoomStatus: async (_: any, { roomId, status, teamId }: any) => {
      const room = await prisma.room.findUnique({ where: { id: roomId } })

      if (!room) {
        throw new Error('Místnost nebyla nalezena')
      }

      const previousStatus = room.status
      const updateData: any = { status }

      if (status === RoomStatus.FREE || status === RoomStatus.OFFLINE) {
        updateData.currentTeamId = null
        updateData.occupiedSince = null
        updateData.reservedUntil = null
      } else if (teamId) {
        updateData.currentTeamId = teamId
        if (status === RoomStatus.OCCUPIED) {
          updateData.occupiedSince = new Date()
        } else if (status === RoomStatus.RESERVED) {
          updateData.reservedUntil = new Date(Date.now() + 5 * 60 * 1000)
        }
      }

      const updatedRoom = await prisma.room.update({
        where: { id: roomId },
        data: updateData,
        include: { currentTeam: true }
      })

      if (teamId) {
        await prisma.history.create({
          data: {
            roomId,
            teamId,
            action: ActionType.ADMIN_OVERRIDE,
            previousStatus,
            newStatus: status
          }
        })
      }

      const allRooms = await prisma.room.findMany({ include: { currentTeam: true } })
      pubsub.publish(ROOMS_UPDATED, { roomsUpdated: allRooms })

      return updatedRoom
    },

    adminArchiveAndReset: async (_: any, { deleteTeams }: any) => {
      // Archive all history
      const historyCount = await prisma.history.updateMany({
        where: { archivedDate: null },
        data: { archivedDate: new Date() }
      })

      // Create daily stats
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const history = await prisma.history.findMany({
        where: {
          archivedDate: { not: null },
          timestamp: { gte: today }
        }
      })

      const occupations = history.filter(h => h.action === ActionType.OCCUPY).length
      const reservations = history.filter(h => h.action === ActionType.RESERVE).length

      // Calculate team activity
      const teamActivity: Record<string, number> = {}
      history.forEach(h => {
        teamActivity[h.teamId] = (teamActivity[h.teamId] || 0) + 1
      })

      // Find most popular room
      const roomCounts: Record<string, number> = {}
      history.forEach(h => {
        roomCounts[h.roomId] = (roomCounts[h.roomId] || 0) + 1
      })
      const mostPopularRoomId = Object.entries(roomCounts).sort((a, b) => b[1] - a[1])[0]?.[0]

      await prisma.dailyStats.create({
        data: {
          date: today,
          totalOccupations: occupations,
          totalReservations: reservations,
          mostPopularRoomId,
          teamActivity: teamActivity
        }
      })

      // Reset all rooms
      await prisma.room.updateMany({
        data: {
          status: RoomStatus.FREE,
          currentTeamId: null,
          occupiedSince: null,
          reservedUntil: null
        }
      })

      // Optionally delete teams
      if (deleteTeams) {
        // Must delete history first to avoid FK constraint violations
        await prisma.history.deleteMany()
        await prisma.team.deleteMany()
      }

      const allRooms = await prisma.room.findMany({ include: { currentTeam: true } })
      pubsub.publish(ROOMS_UPDATED, { roomsUpdated: allRooms })

      return {
        success: true,
        archivedHistoryCount: historyCount.count,
        message: `Archivováno ${historyCount.count} záznamů. ${deleteTeams ? 'Skupiny smazány.' : 'Skupiny zachovány.'}`
      }
    },

    createRoom: async (_: any, { name, description }: any) => {
      const room = await prisma.room.create({
        data: { name, description, status: RoomStatus.FREE }
      })
      const allRooms = await prisma.room.findMany({ include: { currentTeam: true } })
      pubsub.publish(ROOMS_UPDATED, { roomsUpdated: allRooms })
      return room
    },

    updateRoom: async (_: any, { id, name, description }: any) => {
      const room = await prisma.room.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(description && { description })
        }
      })
      const allRooms = await prisma.room.findMany({ include: { currentTeam: true } })
      pubsub.publish(ROOMS_UPDATED, { roomsUpdated: allRooms })
      return room
    },

    deleteRoom: async (_: any, { id }: any) => {
      try {
        await prisma.history.deleteMany({ where: { roomId: id } })
        await prisma.room.delete({ where: { id } })
        const allRooms = await prisma.room.findMany({ include: { currentTeam: true } })
        pubsub.publish(ROOMS_UPDATED, { roomsUpdated: allRooms })
        return true
      } catch (e) {
        return false
      }
    }
  },

  Subscription: {
    roomsUpdated: {
      subscribe: () => pubsub.asyncIterator([ROOMS_UPDATED])
    }
  }
}
