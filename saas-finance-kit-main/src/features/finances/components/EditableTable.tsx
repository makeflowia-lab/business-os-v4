'use client'

import { useState, useCallback } from 'react'
import { Plus, Trash2, Check, X } from 'lucide-react'
import { formatCurrency } from '../services/analytics'
import { getCategoryColor } from '@/lib/categoryColors'

// Configuracion de columnas generica
export interface ColumnConfig<T> {
  key: keyof T
  header: string
  type: 'text' | 'number' | 'select' | 'toggle'
  options?: { value: string; label: string }[]
  width?: string
  editable?: boolean
  render?: (value: unknown, item: T) => React.ReactNode
}

export interface EditableTableProps<T extends { id: string }> {
  title: string
  subtitle?: string
  items: T[]
  columns: ColumnConfig<T>[]
  onAdd: (item: Omit<T, 'id' | 'created_at'>) => Promise<void>
  onUpdate: (id: string, updates: Partial<T>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  isLoading?: boolean
  getTotal?: (items: T[]) => number
  totalLabel?: string
  defaultValues: Omit<T, 'id' | 'created_at'>
}

interface EditingCell {
  id: string
  key: string
}

export function EditableTable<T extends { id: string }>({
  title,
  subtitle,
  items,
  columns,
  onAdd,
  onUpdate,
  onDelete,
  isLoading,
  getTotal,
  totalLabel = 'Total',
  defaultValues,
}: EditableTableProps<T>) {
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null)
  const [editValue, setEditValue] = useState<string>('')
  const [isAdding, setIsAdding] = useState(false)
  const [newRow, setNewRow] = useState<Omit<T, 'id' | 'created_at'>>(defaultValues)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Iniciar edicion de celda
  const startEditing = useCallback((id: string, key: string, value: unknown) => {
    setEditingCell({ id, key })
    setEditValue(String(value ?? ''))
  }, [])

  // Guardar edicion
  const saveEdit = useCallback(async (value?: string) => {
    if (!editingCell) return

    const finalValue = value ?? editValue
    const column = columns.find(c => c.key === editingCell.key)

    let parsedValue: unknown = finalValue
    if (column?.type === 'number') {
      parsedValue = parseFloat(finalValue) || 0
    } else if (column?.type === 'toggle') {
      parsedValue = finalValue === 'true'
    }

    try {
      await onUpdate(editingCell.id, { [editingCell.key]: parsedValue } as Partial<T>)
    } catch (error) {
      console.error('Error updating:', error)
    }

    setEditingCell(null)
    setEditValue('')
  }, [editingCell, editValue, columns, onUpdate])

  // Cancelar edicion
  const cancelEdit = useCallback(() => {
    setEditingCell(null)
    setEditValue('')
  }, [])

  // Toggle activo (sin necesidad de modo edicion)
  const handleToggle = useCallback(async (id: string, key: keyof T, currentValue: boolean) => {
    try {
      await onUpdate(id, { [key]: !currentValue } as Partial<T>)
    } catch (error) {
      console.error('Error toggling:', error)
    }
  }, [onUpdate])

  // Agregar nueva fila
  const handleAdd = useCallback(async () => {
    try {
      await onAdd(newRow)
      setNewRow(defaultValues)
      setIsAdding(false)
    } catch (error) {
      console.error('Error adding:', error)
    }
  }, [newRow, defaultValues, onAdd])

  // Eliminar fila
  const handleDelete = useCallback(async (id: string) => {
    try {
      await onDelete(id)
      setDeletingId(null)
    } catch (error) {
      console.error('Error deleting:', error)
    }
  }, [onDelete])

  // Renderizar celda
  const renderCell = (item: T, column: ColumnConfig<T>) => {
    const value = item[column.key]
    const isEditing = editingCell?.id === item.id && editingCell?.key === column.key
    const editable = column.editable !== false

    // Toggle - siempre interactivo
    if (column.type === 'toggle') {
      return (
        <td key={String(column.key)} className={`py-3 px-2 ${column.width || ''}`}>
          <button
            onClick={() => handleToggle(item.id, column.key, Boolean(value))}
            disabled={isLoading}
            className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all
              ${value
                ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                : 'border-gray-300 hover:border-gray-400'
              }
              disabled:opacity-50`}
          >
            {value && <Check className="w-4 h-4" />}
          </button>
        </td>
      )
    }

    // Celda en modo edicion
    if (isEditing && editable) {
      if (column.type === 'select' && column.options) {
        return (
          <td key={String(column.key)} className={`py-2 px-2 ${column.width || ''}`}>
            <select
              value={editValue}
              onChange={(e) => saveEdit(e.target.value)}
              onBlur={() => cancelEdit()}
              autoFocus
              className="w-full px-2 py-1.5 bg-white border-2 border-blue-400 rounded-lg
                focus:outline-none text-sm"
            >
              {column.options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </td>
        )
      }

      return (
        <td key={String(column.key)} className={`py-2 px-2 ${column.width || ''}`}>
          <input
            type={column.type === 'number' ? 'number' : 'text'}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={() => saveEdit()}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveEdit()
              if (e.key === 'Escape') cancelEdit()
            }}
            autoFocus
            className="w-full px-2 py-1.5 bg-white border-2 border-blue-400 rounded-lg
              focus:outline-none text-sm"
          />
        </td>
      )
    }

    // Celda normal (clickeable para editar)
    const displayValue = column.render
      ? column.render(value, item)
      : column.type === 'number'
        ? formatCurrency(Number(value))
        : String(value ?? '')

    // Render especial para categoria con color
    const isCategoryColumn = String(column.key).toLowerCase().includes('categoria')

    return (
      <td
        key={String(column.key)}
        className={`py-3 px-2 ${column.width || ''} ${editable ? 'cursor-pointer hover:bg-gray-50' : ''} transition-colors`}
        onClick={() => editable && startEditing(item.id, String(column.key), value)}
      >
        {isCategoryColumn ? (
          <span
            className="px-2 py-1 rounded-md text-xs font-medium text-white"
            style={{ backgroundColor: getCategoryColor(String(value)) }}
          >
            {String(value)}
          </span>
        ) : (
          <span className="text-sm text-gray-700">{displayValue}</span>
        )}
      </td>
    )
  }

  // Renderizar celda de nueva fila
  const renderNewRowCell = (column: ColumnConfig<T>) => {
    const value = newRow[column.key as keyof typeof newRow]

    if (column.type === 'toggle') {
      return (
        <td key={String(column.key)} className={`py-3 px-2 ${column.width || ''}`}>
          <button
            onClick={() => setNewRow(prev => ({ ...prev, [column.key]: !prev[column.key as keyof typeof prev] }))}
            className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all
              ${value
                ? 'bg-emerald-500 border-emerald-500 text-white'
                : 'border-gray-300'
              }`}
          >
            {value && <Check className="w-4 h-4" />}
          </button>
        </td>
      )
    }

    if (column.type === 'select' && column.options) {
      return (
        <td key={String(column.key)} className={`py-2 px-2 ${column.width || ''}`}>
          <select
            value={String(value ?? '')}
            onChange={(e) => setNewRow(prev => ({ ...prev, [column.key]: e.target.value }))}
            className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg
              focus:outline-none focus:border-blue-400 text-sm"
          >
            {column.options.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </td>
      )
    }

    return (
      <td key={String(column.key)} className={`py-2 px-2 ${column.width || ''}`}>
        <input
          type={column.type === 'number' ? 'number' : 'text'}
          value={String(value ?? '')}
          onChange={(e) => setNewRow(prev => ({
            ...prev,
            [column.key]: column.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value
          }))}
          placeholder={column.header}
          className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg
            focus:outline-none focus:border-blue-400 text-sm"
        />
      </td>
    )
  }

  const total = getTotal ? getTotal(items) : null

  return (
    <div className="bg-neu-bg shadow-neu rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-4">
            {total !== null && (
              <div className="text-right">
                <p className="text-xs text-gray-500">{totalLabel}</p>
                <p className="text-lg font-bold text-red-500">{formatCurrency(total)}</p>
              </div>
            )}
            <button
              onClick={() => setIsAdding(true)}
              disabled={isAdding || isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-neu-bg shadow-neu rounded-xl
                text-gray-700 hover:shadow-neu-sm transition-shadow disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">Agregar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
              {columns.map(col => (
                <th key={String(col.key)} className={`py-4 px-2 font-medium ${col.width || ''}`}>
                  {col.header}
                </th>
              ))}
              <th className="py-4 px-2 w-16"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {/* Nueva fila */}
            {isAdding && (
              <tr className="bg-blue-50/50">
                {columns.map(col => renderNewRowCell(col))}
                <td className="py-2 px-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleAdd}
                      disabled={isLoading}
                      className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setIsAdding(false)
                        setNewRow(defaultValues)
                      }}
                      className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            )}

            {/* Filas existentes */}
            {items.map(item => (
              <tr
                key={item.id}
                className={`hover:bg-gray-50/50 transition-colors
                  ${deletingId === item.id ? 'bg-red-50' : ''}`}
              >
                {columns.map(col => renderCell(item, col))}
                <td className="py-3 px-2">
                  {deletingId === item.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingId(null)}
                        className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeletingId(item.id)}
                      disabled={isLoading}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50
                        rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}

            {/* Empty state */}
            {items.length === 0 && !isAdding && (
              <tr>
                <td colSpan={columns.length + 1} className="py-12 text-center text-gray-400">
                  No hay datos. Haz clic en &quot;Agregar&quot; para comenzar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
