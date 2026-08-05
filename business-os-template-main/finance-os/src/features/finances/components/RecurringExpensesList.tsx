'use client'

import { useState } from 'react'
import { Plus, Trash2, Edit2, Check, X, Calendar } from 'lucide-react'
import { NeuButton } from '@/shared/components/ui/NeuButton'
import { NeuInput } from '@/shared/components/ui/NeuInput'
import { NeuSelect } from '@/shared/components/ui/NeuSelect'
import { GastoMensual, GastoAnual, EXPENSE_CATEGORIES } from '../types'
import { formatCurrency } from '../services/analytics'
import { getCategoryColor } from '@/lib/categoryColors'

// Nombres de meses
const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

interface RecurringExpensesListProps {
  type: 'mensual' | 'anual'
  items: GastoMensual[] | GastoAnual[]
  onAdd: (item: Partial<GastoMensual> | Partial<GastoAnual>) => Promise<void>
  onUpdate: (id: string, updates: Partial<GastoMensual> | Partial<GastoAnual>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  isLoading?: boolean
}

export function RecurringExpensesList({
  type,
  items,
  onAdd,
  onUpdate,
  onDelete,
  isLoading = false,
}: RecurringExpensesListProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    nombre: '',
    categoria: '',
    monto: '',
    dia: '1',
    mes: '1',
  })
  const [editData, setEditData] = useState({
    nombre: '',
    categoria: '',
    monto: '',
    dia: '1',
    mes: '1',
  })

  const totalActivo = (items as (GastoMensual | GastoAnual)[])
    .filter((i) => i.activo)
    .reduce((sum, i) => sum + Number(i.monto), 0)

  const resetForm = () => {
    setFormData({ nombre: '', categoria: '', monto: '', dia: '1', mes: '1' })
  }

  const handleAdd = async () => {
    if (!formData.nombre || !formData.categoria || !formData.monto) return

    const baseData = {
      categoria: formData.categoria,
      monto: parseFloat(formData.monto),
      activo: true,
    }

    if (type === 'mensual') {
      await onAdd({
        ...baseData,
        nombre_app: formData.nombre,
        dia_de_cobro: parseInt(formData.dia),
      })
    } else {
      await onAdd({
        ...baseData,
        nombre_servicio: formData.nombre,
        dia_de_cobro: parseInt(formData.dia),
        mes_de_cobro: parseInt(formData.mes),
      })
    }

    resetForm()
    setIsAdding(false)
  }

  const handleToggleActive = async (item: GastoMensual | GastoAnual) => {
    await onUpdate(item.id, { activo: !item.activo })
  }

  const startEditing = (item: GastoMensual | GastoAnual) => {
    const nombre = type === 'mensual'
      ? (item as GastoMensual).nombre_app
      : (item as GastoAnual).nombre_servicio

    setEditData({
      nombre,
      categoria: item.categoria,
      monto: String(item.monto),
      dia: String(item.dia_de_cobro),
      mes: type === 'anual' ? String((item as GastoAnual).mes_de_cobro) : '1',
    })
    setEditingId(item.id)
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditData({ nombre: '', categoria: '', monto: '', dia: '1', mes: '1' })
  }

  const handleSaveEdit = async (id: string) => {
    if (!editData.nombre || !editData.categoria || !editData.monto) return

    const baseUpdates = {
      categoria: editData.categoria,
      monto: parseFloat(editData.monto),
      dia_de_cobro: parseInt(editData.dia),
    }

    if (type === 'mensual') {
      await onUpdate(id, {
        ...baseUpdates,
        nombre_app: editData.nombre,
      })
    } else {
      await onUpdate(id, {
        ...baseUpdates,
        nombre_servicio: editData.nombre,
        mes_de_cobro: parseInt(editData.mes),
      })
    }

    cancelEditing()
  }

  const handleDelete = async (id: string) => {
    await onDelete(id)
  }

  const getName = (item: GastoMensual | GastoAnual) => {
    return type === 'mensual'
      ? (item as GastoMensual).nombre_app
      : (item as GastoAnual).nombre_servicio
  }

  const getDate = (item: GastoMensual | GastoAnual) => {
    if (type === 'mensual') {
      return `Dia ${(item as GastoMensual).dia_de_cobro}`
    } else {
      const anual = item as GastoAnual
      return `${anual.dia_de_cobro} de ${MESES[anual.mes_de_cobro - 1]}`
    }
  }

  return (
    <div className="bg-neu-bg shadow-neu rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-700">
            Gastos {type === 'mensual' ? 'Mensuales' : 'Anuales'}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Total activo: <span className="font-medium text-red-600">{formatCurrency(totalActivo)}</span>
            {type === 'anual' && (
              <span className="ml-2 text-gray-400">
                ({formatCurrency(totalActivo / 12)}/mes)
              </span>
            )}
          </p>
        </div>
        {!isAdding && (
          <NeuButton variant="primary" size="sm" onClick={() => setIsAdding(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Agregar
          </NeuButton>
        )}
      </div>

      {/* Add form */}
      {isAdding && (
        <div className="mb-6 p-4 bg-gray-50/50 rounded-xl space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <NeuInput
              label="Nombre"
              placeholder={type === 'mensual' ? 'Netflix, Spotify...' : 'Dominio, Hosting...'}
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            />
            <NeuSelect
              label="Categoria"
              value={formData.categoria}
              onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
              options={[
                { value: '', label: 'Selecciona...' },
                ...EXPENSE_CATEGORIES.map((c) => ({ value: c, label: c })),
              ]}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <NeuInput
              label="Monto"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.monto}
              onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
            />
            <NeuSelect
              label="Dia"
              value={formData.dia}
              onChange={(e) => setFormData({ ...formData, dia: e.target.value })}
              options={Array.from({ length: 31 }, (_, i) => ({
                value: String(i + 1),
                label: String(i + 1),
              }))}
            />
            {type === 'anual' && (
              <NeuSelect
                label="Mes"
                value={formData.mes}
                onChange={(e) => setFormData({ ...formData, mes: e.target.value })}
                options={MESES.map((m, i) => ({
                  value: String(i + 1),
                  label: m,
                }))}
              />
            )}
          </div>
          <div className="flex justify-end gap-2">
            <NeuButton
              variant="secondary"
              size="sm"
              onClick={() => {
                resetForm()
                setIsAdding(false)
              }}
            >
              <X className="w-4 h-4 mr-1" />
              Cancelar
            </NeuButton>
            <NeuButton variant="primary" size="sm" onClick={handleAdd}>
              <Check className="w-4 h-4 mr-1" />
              Guardar
            </NeuButton>
          </div>
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="h-32 flex items-center justify-center text-gray-400">
          Cargando...
        </div>
      ) : items.length === 0 ? (
        <div className="h-32 flex items-center justify-center text-gray-400">
          No hay gastos {type === 'mensual' ? 'mensuales' : 'anuales'} registrados
        </div>
      ) : (
        <div className="space-y-3">
          {(items as (GastoMensual | GastoAnual)[]).map((item) => (
            <div key={item.id}>
              {editingId === item.id ? (
                /* Formulario de edición inline */
                <div className="p-4 bg-blue-50/50 rounded-xl space-y-4 border-2 border-blue-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <NeuInput
                      label="Nombre"
                      value={editData.nombre}
                      onChange={(e) => setEditData({ ...editData, nombre: e.target.value })}
                    />
                    <NeuSelect
                      label="Categoría"
                      value={editData.categoria}
                      onChange={(e) => setEditData({ ...editData, categoria: e.target.value })}
                      options={EXPENSE_CATEGORIES.map((c) => ({ value: c, label: c }))}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <NeuInput
                      label="Monto"
                      type="number"
                      step="0.01"
                      value={editData.monto}
                      onChange={(e) => setEditData({ ...editData, monto: e.target.value })}
                    />
                    <NeuSelect
                      label="Día"
                      value={editData.dia}
                      onChange={(e) => setEditData({ ...editData, dia: e.target.value })}
                      options={Array.from({ length: 31 }, (_, i) => ({
                        value: String(i + 1),
                        label: String(i + 1),
                      }))}
                    />
                    {type === 'anual' && (
                      <NeuSelect
                        label="Mes"
                        value={editData.mes}
                        onChange={(e) => setEditData({ ...editData, mes: e.target.value })}
                        options={MESES.map((m, i) => ({
                          value: String(i + 1),
                          label: m,
                        }))}
                      />
                    )}
                  </div>
                  <div className="flex justify-end gap-2">
                    <NeuButton variant="secondary" size="sm" onClick={cancelEditing}>
                      <X className="w-4 h-4 mr-1" />
                      Cancelar
                    </NeuButton>
                    <NeuButton variant="primary" size="sm" onClick={() => handleSaveEdit(item.id)}>
                      <Check className="w-4 h-4 mr-1" />
                      Guardar
                    </NeuButton>
                  </div>
                </div>
              ) : (
                /* Vista normal del item */
                <div
                  className={`
                    flex items-center justify-between p-4 rounded-xl transition-all duration-200
                    ${item.activo ? 'bg-white shadow-sm' : 'bg-gray-100 opacity-60'}
                  `}
                >
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleToggleActive(item)}
                      className={`
                        w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors
                        ${item.activo ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300'}
                      `}
                    >
                      {item.activo && <Check className="w-3 h-3" />}
                    </button>
                    <div>
                      <p className={`font-medium ${item.activo ? 'text-gray-800' : 'text-gray-500 line-through'}`}>
                        {getName(item)}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span
                          className="px-2 py-0.5 rounded text-xs text-white font-medium"
                          style={{ backgroundColor: getCategoryColor(item.categoria) }}
                        >
                          {item.categoria}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {getDate(item)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`font-semibold ${item.activo ? 'text-red-600' : 'text-gray-400'}`}>
                      {formatCurrency(Number(item.monto))}
                    </span>
                    <button
                      onClick={() => startEditing(item)}
                      className="p-2 rounded-lg bg-neu-bg shadow-neu hover:shadow-neu-inset text-gray-400 hover:text-blue-500 transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 rounded-lg bg-neu-bg shadow-neu hover:shadow-neu-inset text-gray-400 hover:text-red-500 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
