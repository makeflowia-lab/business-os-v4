'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useTasksStore } from '@/shared/stores/tasks-store'
import { PRIORITY_CONFIG } from '../utils/priority'
import { X, ChevronDown, Bookmark } from 'lucide-react'
import { useTemplatesStore, type TaskTemplate } from '@/shared/stores/templates-store'
import { TemplatesPicker } from './TemplatesPicker'
import { useAuth } from '@/hooks/useAuth'
import { notifyTaskAssigned } from '@/lib/notifications'
import type { TaskStatus, TaskPriority, Label, Profile } from '@/types/database'

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'backlog', label: 'Backlog' },
  { value: 'todo', label: 'To-do' },
  { value: 'in_progress', label: 'In Progress' },
]

interface CreateTaskModalProps {
  isOpen: boolean
  onClose: () => void
  defaultStatus?: TaskStatus
}

export function CreateTaskModal({ isOpen, onClose, defaultStatus = 'backlog' }: CreateTaskModalProps) {
  const addTask = useTasksStore((s) => s.addTask)
  const addTemplate = useTemplatesStore((s) => s.addTemplate)
  const { profile } = useAuth()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<TaskStatus>(defaultStatus)
  const [priority, setPriority] = useState<TaskPriority>(0)
  const [dueAt, setDueAt] = useState('')
  const [selectedLabels, setSelectedLabels] = useState<Label[]>([])
  const [selectedAssignee, setSelectedAssignee] = useState<string>('')
  const [allLabels, setAllLabels] = useState<Label[]>([])
  const [allProfiles, setAllProfiles] = useState<Profile[]>([])
  const [priorityOpen, setPriorityOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const fetchData = useCallback(async () => {
    const supabase = createClient()
    const [labelsRes, profilesRes] = await Promise.all([
      supabase.from('labels').select('*').order('name'),
      supabase.from('profiles').select('*').order('full_name'),
    ])
    if (labelsRes.data) setAllLabels(labelsRes.data as Label[])
    if (profilesRes.data) setAllProfiles(profilesRes.data as Profile[])
  }, [])

  useEffect(() => {
    if (isOpen) {
      fetchData()
      setStatus(defaultStatus)
    }
  }, [isOpen, defaultStatus, fetchData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || loading) return

    setLoading(true)
    const supabase = createClient()

    const { data: task, error } = await supabase
      .from('tasks')
      .insert({
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        due_at: dueAt ? new Date(dueAt).toISOString() : null,
      })
      .select('*')
      .single()

    if (error || !task) {
      setLoading(false)
      return
    }

    // Assign to profile (person)
    if (selectedAssignee) {
      await supabase.from('task_assignees').insert({
        task_id: task.id,
        profile_id: selectedAssignee,
      })
      notifyTaskAssigned(selectedAssignee, task.title, task.id, profile?.id)
    }

    // Assign labels
    if (selectedLabels.length > 0) {
      await supabase.from('task_labels').insert(
        selectedLabels.map((l) => ({ task_id: task.id, label_id: l.id }))
      )
    }

    // Build full task object for store
    const assignee = allProfiles.find((p) => p.id === selectedAssignee)
    addTask({
      ...task,
      sequence_number: task.sequence_number,
      priority: task.priority ?? 0,
      due_at: task.due_at ?? null,
      estimate: task.estimate ?? null,
      parent_task_id: task.parent_task_id ?? null,
      position: task.position ?? 0,
      assignees: assignee ? [assignee] : [],
      labels: selectedLabels,
    })

    // Reset
    setTitle('')
    setDescription('')
    setStatus(defaultStatus)
    setPriority(0)
    setDueAt('')
    setSelectedLabels([])
    setSelectedAssignee('')
    setLoading(false)
    onClose()
  }

  const handleToggleLabel = (label: Label) => {
    setSelectedLabels((prev) =>
      prev.some((l) => l.id === label.id)
        ? prev.filter((l) => l.id !== label.id)
        : [...prev, label]
    )
  }

  const handleApplyTemplate = (template: TaskTemplate) => {
    setTitle(template.title)
    setDescription(template.description)
    setStatus(template.status)
    setPriority(template.priority)
    const matchingLabels = allLabels.filter((l) => template.labelIds.includes(l.id))
    setSelectedLabels(matchingLabels)
  }

  const handleSaveAsTemplate = () => {
    if (!title.trim()) return
    addTemplate({
      name: title.trim(),
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      estimate: null,
      labelIds: selectedLabels.map((l) => l.id),
    })
  }

  if (!isOpen) return null

  const priorityConfig = PRIORITY_CONFIG[priority]

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 z-50" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-lg bg-[#12121a] border border-white/[0.1] rounded-2xl shadow-2xl shadow-black/60 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Specular rim */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-t-2xl" />

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
            <h2 className="text-sm font-semibold text-white">New Task</h2>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/[0.08] text-white/40 hover:text-white/80 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-4">
            {/* Title */}
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title..."
              autoFocus
              className="w-full bg-transparent text-lg font-semibold text-white placeholder:text-white/20 outline-none"
            />

            {/* Description */}
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add description..."
              rows={3}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/80 placeholder:text-white/20 outline-none focus:border-white/[0.15] resize-none"
            />

            {/* Properties row */}
            <div className="flex flex-wrap gap-2">
              {/* Status */}
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="bg-white/[0.06] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-white/80 outline-none"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>

              {/* Priority */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setPriorityOpen(!priorityOpen)}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs border border-white/[0.08] ${priorityConfig.bgColor} ${priorityConfig.color}`}
                >
                  <span>{priorityConfig.icon}</span>
                  {priorityConfig.label}
                  <ChevronDown size={10} />
                </button>
                {priorityOpen && (
                  <div className="absolute top-full left-0 mt-1 bg-[#15151f] border border-white/[0.1] rounded-lg overflow-hidden z-10 shadow-xl shadow-black/40 min-w-[140px]">
                    {([0, 1, 2, 3, 4] as TaskPriority[]).map((p) => {
                      const cfg = PRIORITY_CONFIG[p]
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => { setPriority(p); setPriorityOpen(false) }}
                          className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 transition-colors hover:bg-white/[0.06] ${cfg.color}`}
                        >
                          <span>{cfg.icon}</span>
                          {cfg.label}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Due Date */}
              <input
                type="date"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
                className="bg-white/[0.06] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-white/80 outline-none [color-scheme:dark]"
              />

              {/* Assignee */}
              <select
                value={selectedAssignee}
                onChange={(e) => setSelectedAssignee(e.target.value)}
                className="bg-white/[0.06] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-white/80 outline-none"
              >
                <option value="">Unassigned</option>
                {allProfiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.full_name ?? profile.email ?? 'User'}
                  </option>
                ))}
              </select>
            </div>

            {/* Labels */}
            {allLabels.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {allLabels.map((label) => {
                  const isActive = selectedLabels.some((l) => l.id === label.id)
                  return (
                    <button
                      key={label.id}
                      type="button"
                      onClick={() => handleToggleLabel(label)}
                      className={`text-[10px] px-2 py-1 rounded-full border transition-colors flex items-center gap-1
                        ${isActive ? 'border-white/[0.15]' : 'border-white/[0.06] opacity-50 hover:opacity-80'}
                      `}
                      style={{
                        backgroundColor: isActive ? `${label.color}25` : `${label.color}10`,
                        color: label.color,
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: label.color }} />
                      {label.name}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Templates */}
            <TemplatesPicker onSelect={handleApplyTemplate} />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={handleSaveAsTemplate}
              disabled={!title.trim()}
              className="flex items-center gap-1.5 text-[10px] text-white/30 hover:text-white/60 transition-colors disabled:opacity-30"
              title="Save current values as a reusable template"
            >
              <Bookmark size={10} />
              Save as template
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg text-xs text-white/50 hover:text-white/80 hover:bg-white/[0.06] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim() || loading}
                className="px-4 py-1.5 rounded-lg text-xs font-medium bg-white/[0.1] text-white border border-white/[0.15] hover:bg-white/[0.15] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Task'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  )
}
