'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { GET_ROOMS, CREATE_ROOM, DELETE_ROOM, UPDATE_ROOM } from '@/lib/graphql/queries'

export default function RoomManager() {
  const [expanded, setExpanded] = useState(false)
  const [newRoomName, setNewRoomName] = useState('')
  const [newRoomDesc, setNewRoomDesc] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')

  const { data, loading } = useQuery(GET_ROOMS, {
    skip: !expanded
  })

  const [createRoom] = useMutation(CREATE_ROOM, {
    refetchQueries: [{ query: GET_ROOMS }]
  })
  const [deleteRoom] = useMutation(DELETE_ROOM, {
    refetchQueries: [{ query: GET_ROOMS }]
  })
  const [updateRoom] = useMutation(UPDATE_ROOM, {
    refetchQueries: [{ query: GET_ROOMS }]
  })

  const rooms = data?.rooms || []

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRoomName.trim()) return

    try {
      await createRoom({
        variables: {
          name: newRoomName.trim(),
          description: newRoomDesc.trim() || 'Bez popisu'
        }
      })
      setNewRoomName('')
      setNewRoomDesc('')
    } catch (error) {
      alert('Chyba při vytváření místnosti')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Opravdu chcete smazat tuto místnost? Smaže se i její historie.')) return

    try {
      await deleteRoom({ variables: { id } })
    } catch (error) {
      alert('Chyba při mazání místnosti')
    }
  }

  const startEdit = (room: any) => {
    setEditingId(room.id)
    setEditName(room.name)
    setEditDesc(room.description)
  }

  const handleUpdate = async () => {
    if (!editingId) return

    try {
      await updateRoom({
        variables: {
          id: editingId,
          name: editName,
          description: editDesc
        }
      })
      setEditingId(null)
    } catch (error) {
      alert('Chyba při úpravě místnosti')
    }
  }

  return (
    <div className="bg-card rounded-lg shadow-lg mb-6 border border-primary/20">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex justify-between items-center hover:bg-primary/10 transition-colors rounded-lg"
      >
        <div>
          <h2 className="text-xl font-bold text-primary">Správa místností</h2>
          <p className="text-sm text-gray-400">Přidat, upravit nebo smazat místnosti</p>
        </div>
        <span className="text-2xl text-primary">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className="p-4 border-t border-gray-700">
          {/* Add Room Form */}
          <form onSubmit={handleCreate} className="mb-8 p-4 bg-background rounded-lg border border-gray-700">
            <h3 className="text-lg font-bold mb-4 text-white">Nová místnost</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Název / Číslo místnosti"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                className="px-4 py-2 bg-gray-800 border border-gray-600 rounded focus:border-primary focus:outline-none text-white"
                required
              />
              <input
                type="text"
                placeholder="Popis (volitelné)"
                value={newRoomDesc}
                onChange={(e) => setNewRoomDesc(e.target.value)}
                className="px-4 py-2 bg-gray-800 border border-gray-600 rounded focus:border-primary focus:outline-none text-white"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-primary hover:bg-primary-dark text-white font-bold rounded transition-colors"
              >
                Přidat místnost
              </button>
            </div>
          </form>

          {/* Rooms List */}
          {loading ? (
            <p className="text-center text-gray-400 py-4">Načítání...</p>
          ) : (
            <div className="space-y-3">
              {rooms.map((room: any) => (
                <div
                  key={room.id}
                  className="flex items-center justify-between p-3 bg-background rounded border border-gray-700"
                >
                  {editingId === room.id ? (
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 mr-4">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="px-3 py-1 bg-gray-800 border border-gray-600 rounded text-white"
                      />
                      <input
                        type="text"
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        className="px-3 py-1 bg-gray-800 border border-gray-600 rounded text-white"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleUpdate}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                        >
                          Uložit
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm"
                        >
                          Zrušit
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <span className="font-bold text-white mr-3">{room.name}</span>
                        <span className="text-gray-400 text-sm">{room.description}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(room)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                        >
                          Upravit
                        </button>
                        <button
                          onClick={() => handleDelete(room.id)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                        >
                          Smazat
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
