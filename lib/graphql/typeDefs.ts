export const typeDefs = `#graphql
  enum RoomStatus {
    FREE
    OCCUPIED
    RESERVED
    OFFLINE
  }

  enum ActionType {
    OCCUPY
    RESERVE
    FREE
    CANCEL_RESERVATION
    ADMIN_OVERRIDE
  }

  type Team {
    id: ID!
    name: String!
    color: String!
    createdAt: String!
    isArchived: Boolean!
    rooms: [Room!]!
  }

  type Room {
    id: ID!
    name: String!
    description: String!
    status: RoomStatus!
    currentTeamId: String
    currentTeam: Team
    occupiedSince: String
    reservedUntil: String
    updatedAt: String!
  }

  type History {
    id: ID!
    roomId: String!
    room: Room!
    teamId: String!
    team: Team!
    action: ActionType!
    timestamp: String!
    previousStatus: RoomStatus
    newStatus: RoomStatus!
    archivedDate: String
  }

  type DailyStats {
    id: ID!
    date: String!
    totalOccupations: Int!
    totalReservations: Int!
    mostPopularRoomId: String
    averageOccupationMins: Int
    teamActivity: String!
  }

  type Stats {
    occupiedCount: Int!
    reservedCount: Int!
    totalRooms: Int!
    activeTeams: Int!
  }

  type ArchiveResult {
    success: Boolean!
    archivedHistoryCount: Int!
    message: String!
  }

  input HistoryFilter {
    teamId: String
    roomId: String
    action: ActionType
  }

  type Query {
    rooms: [Room!]!
    teams: [Team!]!
    history(filter: HistoryFilter): [History!]!
    dailyStats(date: String): DailyStats
    currentStats: Stats!
  }

  type Mutation {
    createTeam(name: String!, color: String!): Team!
    occupyRoom(roomId: ID!, teamId: ID!): Room!
    reserveRoom(roomId: ID!, teamId: ID!): Room!
    freeRoom(roomId: ID!, teamId: ID!): Room!
    cancelReservation(roomId: ID!, teamId: ID!): Room!
    adminSetRoomStatus(roomId: ID!, status: RoomStatus!, teamId: ID): Room!
    adminArchiveAndReset(deleteTeams: Boolean!): ArchiveResult!
    createRoom(name: String!, description: String!): Room!
    updateRoom(id: ID!, name: String, description: String): Room!
    deleteRoom(id: ID!): Boolean!
  }

  type Subscription {
    roomsUpdated: [Room!]!
  }
`
