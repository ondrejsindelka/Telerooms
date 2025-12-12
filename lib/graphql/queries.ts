import { gql } from '@apollo/client'

export const GET_ROOMS = gql`
  query GetRooms {
    rooms {
      id
      name
      description
      status
      currentTeamId
      currentTeam {
        id
        name
        color
      }
      occupiedSince
      reservedUntil
      updatedAt
    }
  }
`

export const GET_CURRENT_STATS = gql`
  query GetCurrentStats {
    currentStats {
      occupiedCount
      reservedCount
      totalRooms
      activeTeams
    }
  }
`

export const GET_TEAMS = gql`
  query GetTeams {
    teams {
      id
      name
      color
      createdAt
      isArchived
    }
  }
`

export const GET_HISTORY = gql`
  query GetHistory($filter: HistoryFilter) {
    history(filter: $filter) {
      id
      roomId
      room {
        name
      }
      teamId
      team {
        name
        color
      }
      action
      timestamp
      previousStatus
      newStatus
    }
  }
`

export const CREATE_TEAM = gql`
  mutation CreateTeam($name: String!, $color: String!) {
    createTeam(name: $name, color: $color) {
      id
      name
      color
    }
  }
`

export const OCCUPY_ROOM = gql`
  mutation OccupyRoom($roomId: ID!, $teamId: ID!) {
    occupyRoom(roomId: $roomId, teamId: $teamId) {
      id
      status
      currentTeamId
      occupiedSince
    }
  }
`

export const RESERVE_ROOM = gql`
  mutation ReserveRoom($roomId: ID!, $teamId: ID!) {
    reserveRoom(roomId: $roomId, teamId: $teamId) {
      id
      status
      currentTeamId
      reservedUntil
    }
  }
`

export const FREE_ROOM = gql`
  mutation FreeRoom($roomId: ID!, $teamId: ID!) {
    freeRoom(roomId: $roomId, teamId: $teamId) {
      id
      status
      currentTeamId
      occupiedSince
      reservedUntil
    }
  }
`

export const CANCEL_RESERVATION = gql`
  mutation CancelReservation($roomId: ID!, $teamId: ID!) {
    cancelReservation(roomId: $roomId, teamId: $teamId) {
      id
      status
      currentTeamId
      reservedUntil
    }
  }
`

export const ADMIN_SET_ROOM_STATUS = gql`
  mutation AdminSetRoomStatus($roomId: ID!, $status: RoomStatus!, $teamId: ID) {
    adminSetRoomStatus(roomId: $roomId, status: $status, teamId: $teamId) {
      id
      status
      currentTeamId
    }
  }
`

export const ADMIN_ARCHIVE_AND_RESET = gql`
  mutation AdminArchiveAndReset($deleteTeams: Boolean!) {
    adminArchiveAndReset(deleteTeams: $deleteTeams) {
      success
      archivedHistoryCount
      message
    }
  }
`

export const CREATE_ROOM = gql`
  mutation CreateRoom($name: String!, $description: String!) {
    createRoom(name: $name, description: $description) {
      id
      name
      description
      status
    }
  }
`

export const UPDATE_ROOM = gql`
  mutation UpdateRoom($id: ID!, $name: String, $description: String) {
    updateRoom(id: $id, name: $name, description: $description) {
      id
      name
      description
    }
  }
`

export const DELETE_ROOM = gql`
  mutation DeleteRoom($id: ID!) {
    deleteRoom(id: $id)
  }
`

export const ROOMS_UPDATED_SUBSCRIPTION = gql`
  subscription RoomsUpdated {
    roomsUpdated {
      id
      name
      description
      status
      currentTeamId
      currentTeam {
        id
        name
        color
      }
      occupiedSince
      reservedUntil
      updatedAt
    }
  }
`
