import { prisma } from './prisma'
import { pubsub, ROOMS_UPDATED } from './graphql/pubsub'
import { RoomStatus, ActionType } from '@prisma/client'

export async function checkAndReleaseExpiredReservations() {
  const now = new Date()

  // Find all expired reservations
  const expiredReservations = await prisma.room.findMany({
    where: {
      status: RoomStatus.RESERVED,
      reservedUntil: {
        lte: now
      }
    }
  })

  if (expiredReservations.length === 0) {
    return
  }

  console.log(`Auto-releasing ${expiredReservations.length} expired reservations`)

  // Release each expired reservation
  for (const room of expiredReservations) {
    const teamId = room.currentTeamId

    await prisma.room.update({
      where: { id: room.id },
      data: {
        status: RoomStatus.FREE,
        currentTeamId: null,
        reservedUntil: null
      }
    })

    if (teamId) {
      await prisma.history.create({
        data: {
          roomId: room.id,
          teamId,
          action: ActionType.CANCEL_RESERVATION,
          previousStatus: RoomStatus.RESERVED,
          newStatus: RoomStatus.FREE
        }
      })
    }
  }

  // Publish update
  const allRooms = await prisma.room.findMany({ include: { currentTeam: true } })
  pubsub.publish(ROOMS_UPDATED, { roomsUpdated: allRooms })
}

// Run check every minute
export function startAutoReleaseJob() {
  setInterval(async () => {
    try {
      await checkAndReleaseExpiredReservations()
    } catch (error) {
      console.error('Error in auto-release job:', error)
    }
  }, 60 * 1000) // Every minute

  console.log('Auto-release job started')
}
