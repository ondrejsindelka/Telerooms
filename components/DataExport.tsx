'use client'

import { useState } from 'react'
import { useQuery } from '@apollo/client'
import { toast } from 'sonner'
import { GET_ROOMS, GET_TEAMS, GET_HISTORY, GET_CURRENT_STATS } from '@/lib/graphql/queries'

type ExportFormat = 'csv' | 'json'
type DataType = 'history' | 'rooms' | 'teams' | 'stats' | 'all'

export default function DataExport() {
  const [exporting, setExporting] = useState<string | null>(null)

  const { data: roomsData } = useQuery(GET_ROOMS)
  const { data: teamsData } = useQuery(GET_TEAMS)
  const { data: historyData } = useQuery(GET_HISTORY)
  const { data: statsData } = useQuery(GET_CURRENT_STATS)

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const flattenObject = (obj: any, prefix = ''): any => {
    return Object.keys(obj).reduce((acc: any, key: string) => {
      const pre = prefix.length ? prefix + '_' : ''
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        Object.assign(acc, flattenObject(obj[key], pre + key))
      } else {
        acc[pre + key] = obj[key]
      }
      return acc
    }, {})
  }

  const toCSV = (data: any[]): string => {
    if (!data || data.length === 0) return ''
    const allKeys = Array.from(new Set(data.flatMap(obj => Object.keys(flattenObject(obj)))))
    const header = allKeys.join(',')
    const rows = data.map(obj => {
      const flattened = flattenObject(obj)
      return allKeys.map(key => {
        const value = flattened[key]
        if (value === null || value === undefined) return ''
        const stringValue = String(value)
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`
        }
        return stringValue
      }).join(',')
    })
    return [header, ...rows].join('\n')
  }

  const getDateString = () => new Date().toISOString().split('T')[0]

  const handleExport = async (dataType: DataType, format: ExportFormat) => {
    const key = `${dataType}-${format}`
    setExporting(key)

    try {
      const date = getDateString()

      if (dataType === 'all') {
        const allData = {
          exportedAt: new Date().toISOString(),
          history: historyData?.history || [],
          rooms: roomsData?.rooms || [],
          teams: teamsData?.teams || [],
          stats: statsData?.currentStats || {}
        }

        if (format === 'json') {
          downloadFile(JSON.stringify(allData, null, 2), `telerooms_export_${date}.json`, 'application/json')
        } else {
          // For CSV, create separate files in a combined format
          let csv = '=== MÍSTNOSTI ===\n'
          csv += toCSV(roomsData?.rooms || [])
          csv += '\n\n=== SKUPINY ===\n'
          csv += toCSV(teamsData?.teams || [])
          csv += '\n\n=== HISTORIE ===\n'
          csv += toCSV(historyData?.history || [])
          downloadFile(csv, `telerooms_export_${date}.csv`, 'text/csv')
        }
        toast.success('Kompletní export dokončen!')
        return
      }

      const dataMap: Record<Exclude<DataType, 'all'>, { data: any; name: string }> = {
        history: { data: historyData?.history, name: 'historie' },
        rooms: { data: roomsData?.rooms, name: 'mistnosti' },
        teams: { data: teamsData?.teams, name: 'skupiny' },
        stats: { data: statsData?.currentStats ? [statsData.currentStats] : [], name: 'statistiky' }
      }

      const { data, name } = dataMap[dataType]

      if (!data || (Array.isArray(data) && data.length === 0)) {
        toast.error('Žádná data k exportu')
        return
      }

      if (format === 'json') {
        downloadFile(JSON.stringify(data, null, 2), `${name}_${date}.json`, 'application/json')
      } else {
        const csvData = Array.isArray(data) ? data : [data]
        downloadFile(toCSV(csvData), `${name}_${date}.csv`, 'text/csv')
      }

      toast.success(`Export ${name} dokončen!`)
    } catch (error) {
      toast.error('Chyba při exportu')
    } finally {
      setExporting(null)
    }
  }

  const exportItems = [
    {
      id: 'history' as const,
      title: 'Historie',
      count: historyData?.history?.length || 0,
      unit: 'záznamů',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 'rooms' as const,
      title: 'Místnosti',
      count: roomsData?.rooms?.length || 0,
      unit: 'místností',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    {
      id: 'teams' as const,
      title: 'Skupiny',
      count: teamsData?.teams?.length || 0,
      unit: 'skupin',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    {
      id: 'stats' as const,
      title: 'Statistiky',
      count: null,
      unit: `${statsData?.currentStats?.occupiedCount || 0} obsazeno, ${statsData?.currentStats?.reservedCount || 0} rezervováno`,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    }
  ]

  const ExportButton = ({ dataType, format, small = false }: { dataType: DataType; format: ExportFormat; small?: boolean }) => {
    const isLoading = exporting === `${dataType}-${format}`
    return (
      <button
        onClick={() => handleExport(dataType, format)}
        disabled={!!exporting}
        className={`flex items-center justify-center gap-1.5 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed
          ${small ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'}
          ${format === 'csv'
            ? 'bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/30 text-teal-400'
            : 'bg-white/5 hover:bg-white/10 border border-gray-600 text-gray-300'
          }`}
      >
        {isLoading ? (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        )}
        {format.toUpperCase()}
      </button>
    )
  }

  return (
    <div className="space-y-4">
      {/* Export All - Featured */}
      <div className="p-4 bg-gradient-to-r from-teal-500/10 to-emerald-500/10 backdrop-blur-sm rounded-xl border border-teal-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-500/20 rounded-lg">
              <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-white">Kompletní export</h3>
              <p className="text-xs text-gray-400">Všechna data v jednom souboru</p>
            </div>
          </div>
          <div className="flex gap-2">
            <ExportButton dataType="all" format="csv" />
            <ExportButton dataType="all" format="json" />
          </div>
        </div>
      </div>

      {/* Individual exports */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {exportItems.map((item) => (
          <div
            key={item.id}
            className="p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-teal-500/20 hover:border-teal-500/40 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-1.5 bg-teal-500/10 rounded-lg text-teal-400 shrink-0">
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-white text-sm">{item.title}</h4>
                  <p className="text-xs text-gray-500 truncate">
                    {item.count !== null ? `${item.count} ${item.unit}` : item.unit}
                  </p>
                </div>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <ExportButton dataType={item.id} format="csv" small />
                <ExportButton dataType={item.id} format="json" small />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="text-center text-xs text-gray-500 pt-2">
        CSV pro Excel/Sheets • JSON pro zálohu dat
      </div>
    </div>
  )
}
