'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, RotateCcw, Check, X } from 'lucide-react'
import { HexColorPicker } from 'react-colorful'
import { Category, CategoryType } from '../types'

interface CategoryManagerProps {
  expenseCategories: Category[]
  incomeCategories: Category[]
  onAddCategory: (type: CategoryType, category: Category) => Promise<void>
  onRemoveCategory: (type: CategoryType, name: string) => Promise<void>
  onUpdateCategory: (type: CategoryType, oldName: string, updated: Category) => Promise<void>
  onResetCategories: (type: CategoryType) => Promise<void>
}

interface CategoryItemProps {
  category: Category
  type: CategoryType
  onEdit: () => void
  onDelete: () => void
}

function CategoryItem({ category, onEdit, onDelete }: CategoryItemProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete()
      setConfirmDelete(false)
    } else {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
    }
  }

  return (
    <div className="flex items-center justify-between py-3 px-4 bg-neu-bg shadow-neu-sm rounded-xl group">
      <div className="flex items-center gap-3">
        <div
          className="w-4 h-4 rounded-full shadow-inner"
          style={{ backgroundColor: category.color }}
        />
        <span className="text-gray-700 font-medium">{category.name}</span>
        <span className="text-xs text-gray-400 font-mono">{category.color}</span>
      </div>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          className="p-1.5 rounded-lg bg-neu-bg shadow-neu hover:shadow-neu-inset text-gray-500 hover:text-blue-500 transition-all"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleDelete}
          className={`p-1.5 rounded-lg transition-all ${
            confirmDelete
              ? 'bg-red-500 text-white shadow-lg'
              : 'bg-neu-bg shadow-neu hover:shadow-neu-inset text-gray-500 hover:text-red-500'
          }`}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

interface CategoryFormProps {
  initialData?: Category
  onSubmit: (category: Category) => void
  onCancel: () => void
}

function CategoryForm({ initialData, onSubmit, onCancel }: CategoryFormProps) {
  const [name, setName] = useState(initialData?.name || '')
  const [color, setColor] = useState(initialData?.color || '#6366F1')
  const [showPicker, setShowPicker] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit({ name: name.trim(), color })
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-neu-bg shadow-neu-inset rounded-xl space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">Nombre</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Marketing"
          className="w-full px-4 py-2 bg-neu-bg shadow-neu-inset rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          autoFocus
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">Color</label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowPicker(!showPicker)}
            className="flex items-center gap-2 px-4 py-2 bg-neu-bg shadow-neu rounded-xl hover:shadow-neu-sm transition-shadow"
          >
            <div
              className="w-5 h-5 rounded-full shadow-inner"
              style={{ backgroundColor: color }}
            />
            <span className="text-sm font-mono text-gray-600">{color}</span>
          </button>
          {showPicker && (
            <div className="absolute z-10 mt-2">
              <div
                className="fixed inset-0"
                onClick={() => setShowPicker(false)}
              />
              <div className="relative bg-white p-3 rounded-xl shadow-lg">
                <HexColorPicker color={color} onChange={setColor} />
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-neu-bg shadow-neu rounded-xl text-gray-500 hover:shadow-neu-sm transition-shadow"
        >
          <X className="w-4 h-4" />
        </button>
        <button
          type="submit"
          disabled={!name.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded-xl shadow-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
        >
          <Check className="w-4 h-4" />
        </button>
      </div>
    </form>
  )
}

export function CategoryManager({
  expenseCategories,
  incomeCategories,
  onAddCategory,
  onRemoveCategory,
  onUpdateCategory,
  onResetCategories,
}: CategoryManagerProps) {
  const [addingType, setAddingType] = useState<CategoryType | null>(null)
  const [editingCategory, setEditingCategory] = useState<{ type: CategoryType; name: string } | null>(null)

  const handleAdd = async (type: CategoryType, category: Category) => {
    await onAddCategory(type, category)
    setAddingType(null)
  }

  const handleEdit = async (type: CategoryType, oldName: string, category: Category) => {
    await onUpdateCategory(type, oldName, category)
    setEditingCategory(null)
  }

  const renderSection = (type: CategoryType, categories: Category[], title: string) => {
    const editingThis = editingCategory?.type === type ? editingCategory.name : null

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
          <div className="flex gap-2">
            <button
              onClick={() => onResetCategories(type)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neu-bg shadow-neu rounded-lg text-xs text-gray-500 hover:shadow-neu-sm transition-shadow"
              title="Restaurar defaults"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
            <button
              onClick={() => setAddingType(type)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs shadow-lg hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Agregar
            </button>
          </div>
        </div>

        {addingType === type && (
          <CategoryForm
            onSubmit={(cat) => handleAdd(type, cat)}
            onCancel={() => setAddingType(null)}
          />
        )}

        <div className="space-y-2">
          {categories.map((cat) =>
            editingThis === cat.name ? (
              <CategoryForm
                key={cat.name}
                initialData={cat}
                onSubmit={(updated) => handleEdit(type, cat.name, updated)}
                onCancel={() => setEditingCategory(null)}
              />
            ) : (
              <CategoryItem
                key={cat.name}
                category={cat}
                type={type}
                onEdit={() => setEditingCategory({ type, name: cat.name })}
                onDelete={() => onRemoveCategory(type, cat.name)}
              />
            )
          )}
          {categories.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">
              No hay categorias. Agrega una nueva.
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {renderSection('expense', expenseCategories, 'Categorias de Gastos')}
      <hr className="border-gray-200" />
      {renderSection('income', incomeCategories, 'Categorias de Ingresos')}
    </div>
  )
}
