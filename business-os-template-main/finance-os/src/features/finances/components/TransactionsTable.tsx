'use client'

import { useState, useMemo } from 'react'
import { Trash2, Pencil, TrendingUp, TrendingDown, ArrowRightLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import { Transaction, TipoTransaccion } from '../types'
import { formatCurrency, formatDateFull } from '../services/analytics'
import { getCategoryColor } from '@/lib/categoryColors'

interface TransactionsTableProps {
  transactions: Transaction[]
  onDelete: (id: string) => void
  onEdit: (transaction: Transaction) => void
  isLoading?: boolean
}

type FilterType = 'todos' | TipoTransaccion
type SortField = 'fecha_hora' | 'monto' | 'categoria'
type SortDirection = 'asc' | 'desc'

const PAGE_SIZE_OPTIONS = [20, 50, 100] as const
type PageSize = (typeof PAGE_SIZE_OPTIONS)[number]

export function TransactionsTable({
  transactions,
  onDelete,
  onEdit,
  isLoading = false,
}: TransactionsTableProps) {
  const [filter, setFilter] = useState<FilterType>('todos')
  const [sortField, setSortField] = useState<SortField>('fecha_hora')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState<PageSize>(20)

  // Filtrar
  const filtered =
    filter === 'todos'
      ? transactions
      : transactions.filter((t) => t.tipo === filter)

  // Ordenar
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let comparison = 0

      switch (sortField) {
        case 'fecha_hora':
          comparison = new Date(a.fecha_hora).getTime() - new Date(b.fecha_hora).getTime()
          break
        case 'monto':
          comparison = Number(a.monto) - Number(b.monto)
          break
        case 'categoria':
          comparison = a.categoria.localeCompare(b.categoria)
          break
      }

      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [filtered, sortField, sortDirection])

  // Paginación
  const totalPages = Math.ceil(sorted.length / pageSize)
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return sorted.slice(startIndex, startIndex + pageSize)
  }, [sorted, currentPage, pageSize])

  // Reset página cuando cambia filtro o pageSize
  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter)
    setCurrentPage(1)
  }

  const handlePageSizeChange = (newSize: PageSize) => {
    setPageSize(newSize)
    setCurrentPage(1)
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const handleDelete = (id: string) => {
    if (confirmDelete === id) {
      onDelete(id)
      setConfirmDelete(null)
    } else {
      setConfirmDelete(id)
      setTimeout(() => setConfirmDelete(null), 3000)
    }
  }

  const SortIndicator = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null
    return <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
  }

  return (
    <div className="bg-neu-bg shadow-neu rounded-2xl p-6">
      {/* Header con filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-700">Transacciones</h3>
        <div className="flex gap-2 flex-wrap">
          {(['todos', 'ingreso', 'gasto', 'transferencia'] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => handleFilterChange(f)}
              className={`
                px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                ${
                  filter === f
                    ? 'bg-neu-bg shadow-neu-inset text-blue-600'
                    : 'bg-neu-bg shadow-neu text-gray-600 hover:shadow-neu-sm'
                }
              `}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla */}
      {isLoading ? (
        <div className="h-64 flex items-center justify-center text-gray-400">
          Cargando...
        </div>
      ) : paginatedData.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-400">
          No hay transacciones
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b border-gray-200">
                <th className="pb-3 font-medium">Tipo</th>
                <th
                  className="pb-3 font-medium cursor-pointer hover:text-gray-700"
                  onClick={() => handleSort('fecha_hora')}
                >
                  Fecha
                  <SortIndicator field="fecha_hora" />
                </th>
                <th
                  className="pb-3 font-medium cursor-pointer hover:text-gray-700"
                  onClick={() => handleSort('categoria')}
                >
                  Categoria
                  <SortIndicator field="categoria" />
                </th>
                <th className="pb-3 font-medium">Cuenta</th>
                <th className="pb-3 font-medium">Descripcion</th>
                <th
                  className="pb-3 font-medium text-right cursor-pointer hover:text-gray-700"
                  onClick={() => handleSort('monto')}
                >
                  Monto
                  <SortIndicator field="monto" />
                </th>
                <th className="pb-3 font-medium text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="py-4">
                    <div
                      className={`
                        inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium
                        ${
                          t.tipo === 'ingreso'
                            ? 'bg-emerald-100 text-emerald-700'
                            : t.tipo === 'gasto'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-sky-100 text-sky-700'
                        }
                      `}
                    >
                      {t.tipo === 'ingreso' ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : t.tipo === 'gasto' ? (
                        <TrendingDown className="w-3 h-3" />
                      ) : (
                        <ArrowRightLeft className="w-3 h-3" />
                      )}
                      {t.tipo}
                    </div>
                  </td>
                  <td className="py-4 text-sm text-gray-600">
                    {formatDateFull(t.fecha_hora)}
                  </td>
                  <td className="py-4">
                    <span
                      className="px-2 py-1 rounded text-xs text-white font-medium"
                      style={{ backgroundColor: getCategoryColor(t.categoria) }}
                    >
                      {t.categoria}
                    </span>
                  </td>
                  <td className="py-4 text-sm text-gray-600">
                    {t.tipo === 'transferencia' && t.cuenta_destino
                      ? `${t.cuenta} → ${t.cuenta_destino}`
                      : t.cuenta || '-'}
                  </td>
                  <td className="py-4 text-sm text-gray-500 max-w-xs truncate">
                    {t.descripcion || '-'}
                  </td>
                  <td
                    className={`
                      py-4 text-sm font-semibold text-right
                      ${
                        t.tipo === 'ingreso'
                          ? 'text-emerald-600'
                          : t.tipo === 'gasto'
                          ? 'text-red-600'
                          : 'text-sky-600'
                      }
                    `}
                  >
                    {t.tipo === 'ingreso' ? '+' : t.tipo === 'gasto' ? '-' : '↔'}
                    {formatCurrency(Number(t.monto))}
                  </td>
                  <td className="py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onEdit(t)}
                        className="p-2 rounded-lg transition-all duration-200 bg-neu-bg shadow-neu hover:shadow-neu-inset text-gray-500 hover:text-blue-500"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className={`
                          p-2 rounded-lg transition-all duration-200
                          ${
                            confirmDelete === t.id
                              ? 'bg-red-500 text-white shadow-lg'
                              : 'bg-neu-bg shadow-neu hover:shadow-neu-inset text-gray-500 hover:text-red-500'
                          }
                        `}
                        title={confirmDelete === t.id ? 'Click para confirmar' : 'Eliminar'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer con paginación y total */}
      <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
        {/* Controles de paginación */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Selector de tamaño de página */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Mostrar:</span>
            <div className="flex gap-1">
              {PAGE_SIZE_OPTIONS.map((size) => (
                <button
                  key={size}
                  onClick={() => handlePageSizeChange(size)}
                  className={`
                    px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200
                    ${
                      pageSize === size
                        ? 'bg-neu-bg shadow-neu-inset text-blue-600'
                        : 'bg-neu-bg shadow-neu text-gray-600 hover:shadow-neu-sm'
                    }
                  `}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Navegación de páginas */}
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={`
                  p-2 rounded-lg transition-all duration-200
                  ${
                    currentPage === 1
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'bg-neu-bg shadow-neu hover:shadow-neu-sm text-gray-600'
                  }
                `}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-600 min-w-[100px] text-center">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className={`
                  p-2 rounded-lg transition-all duration-200
                  ${
                    currentPage === totalPages
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'bg-neu-bg shadow-neu hover:shadow-neu-sm text-gray-600'
                  }
                `}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Resumen */}
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>{sorted.length} transacciones en total</span>
          <span className="font-medium">
            Balance filtrado:{' '}
            <span
              className={
                sorted.reduce(
                  (sum, t) =>
                    sum +
                    (t.tipo === 'ingreso'
                      ? Number(t.monto)
                      : t.tipo === 'gasto'
                      ? -Number(t.monto)
                      : 0), // Transferencias no afectan el balance filtrado
                  0
                ) >= 0
                  ? 'text-emerald-600'
                  : 'text-red-600'
              }
            >
              {formatCurrency(
                sorted.reduce(
                  (sum, t) =>
                    sum +
                    (t.tipo === 'ingreso'
                      ? Number(t.monto)
                      : t.tipo === 'gasto'
                      ? -Number(t.monto)
                      : 0),
                  0
                )
              )}
            </span>
          </span>
        </div>
      </div>
    </div>
  )
}
