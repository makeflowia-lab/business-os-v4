'use client'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useTasksStore } from '@/shared/stores/tasks-store'
import { PRIORITY_CONFIG, STATUS_CONFIG, ESTIMATE_OPTIONS, formatDueDate, getDueDateColor } from '../utils/priority'
import { formatDistanceToNow } from 'date-fns'
import {
  X,
  CheckCircle2,
  Archive,
  MessageSquare,
  FileText,
  ChevronDown,
  Calendar,
  Gauge,
  Tag,
  Clock,
  Send,
  ListTree,
  Link2,
  Plus,
  Circle,
  CheckCircle,
  Copy,
  Play,
  Loader2,
  Eye,
  EyeOff,
  ClipboardCheck,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type {
  TaskStatus,
  TaskPriority,
  Label,
  Message,
  Agent,
  Profile,
  Document as DocType,
  Task,
  TaskRelation,
} from '@/types/database'

const STATUS_OPTIONS: { value: TaskStatus; label: string; color: string }[] = [
  { value: 'backlog', label: 'Backlog', color: 'bg-white/[0.08]' },
  { value: 'todo', label: 'To-do', color: 'bg-blue-500/20' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-yellow-500/20' },
  { value: 'done', label: 'Done', color: 'bg-emerald-500/20' },
  { value: 'archived', label: 'Archived', color: 'bg-white/[0.04]' },
]

interface MessageWithAgent extends Omit<Message, 'agent'> {
  agents: Agent | null
}

export function TaskDetailPanel() {
  const selectedTaskId = useTasksStore((s) => s.selectedTaskId)
  const tasks = useTasksStore((s) => s.tasks)
  const selectTask = useTasksStore((s) => s.selectTask)
  const updateTask = useTasksStore((s) => s.updateTask)

  const [messages, setMessages] = useState<MessageWithAgent[]>([])
  const [documents, setDocuments] = useState<DocType[]>([])
  const [allLabels, setAllLabels] = useState<Label[]>([])
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [isEditingDesc, setIsEditingDesc] = useState(false)
  const [editDesc, setEditDesc] = useState('')
  const [descPreview, setDescPreview] = useState(true)
  const [descCopied, setDescCopied] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)
  const [priorityOpen, setPriorityOpen] = useState(false)
  const [estimateOpen, setEstimateOpen] = useState(false)
  const [labelsOpen, setLabelsOpen] = useState(false)
  const [assigneesOpen, setAssigneesOpen] = useState(false)
  const [allProfiles, setAllProfiles] = useState<Profile[]>([])
  const [commentText, setCommentText] = useState('')
  const [commentAgent, setCommentAgent] = useState('')
  const [allAgents, setAllAgents] = useState<Agent[]>([])
  const [sendingComment, setSendingComment] = useState(false)
  const [mentionQuery, setMentionQuery] = useState<string | null>(null)
  const [mentionIndex, setMentionIndex] = useState(0)
  const [previewDocId, setPreviewDocId] = useState<string | null>(null)
  const [subtasks, setSubtasks] = useState<Task[]>([])
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')
  const [addingSubtask, setAddingSubtask] = useState(false)
  const [relations, setRelations] = useState<(TaskRelation & { task: Task })[]>([])
  const [resumingAgent, setResumingAgent] = useState(false)
  const [resumeResult, setResumeResult] = useState<{ ok: boolean; message: string } | null>(null)

  const task = tasks.find((t) => t.id === selectedTaskId)

  const fetchMessages = useCallback(async (taskId: string) => {
    const supabase = createClient()
    const { data } = await supabase
      .from('messages')
      .select('*, agents(*)')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true })

    if (data) {
      setMessages(data as unknown as MessageWithAgent[])
    }
  }, [])

  const fetchDocuments = useCallback(async (taskId: string) => {
    const supabase = createClient()
    const { data } = await supabase
      .from('documents')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false })

    if (data) {
      setDocuments(data as DocType[])
    }
  }, [])

  const fetchAllLabels = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('labels')
      .select('*')
      .order('name')

    if (data) {
      setAllLabels(data as Label[])
    }
  }, [])

  const fetchAllProfiles = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name')

    if (data) {
      setAllProfiles(data as Profile[])
    }
  }, [])

  const fetchAgents = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase.from('agents').select('*').order('name')
    if (data) {
      setAllAgents(data as Agent[])
      if (!commentAgent && data.length > 0) setCommentAgent(data[0].id)
    }
  }, [commentAgent])

  const fetchSubtasks = useCallback(async (taskId: string) => {
    const supabase = createClient()
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('parent_task_id', taskId)
      .order('position')
    if (data) setSubtasks(data as Task[])
  }, [])

  const fetchRelations = useCallback(async (taskId: string) => {
    const supabase = createClient()
    const { data } = await supabase
      .from('task_relations')
      .select('*, tasks!task_relations_target_task_id_fkey(*)')
      .eq('source_task_id', taskId)
    if (data) {
      setRelations(
        (data as unknown as (TaskRelation & { tasks: Task })[]).map((r) => ({
          ...r,
          task: r.tasks,
        }))
      )
    }
  }, [])

  useEffect(() => {
    if (!selectedTaskId) return

    fetchMessages(selectedTaskId)
    fetchDocuments(selectedTaskId)
    fetchAllLabels()
    fetchAllProfiles()
    fetchAgents()
    fetchSubtasks(selectedTaskId)
    fetchRelations(selectedTaskId)

    const supabase = createClient()
    const channel = supabase
      .channel(`messages-${selectedTaskId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `task_id=eq.${selectedTaskId}`,
        },
        () => {
          fetchMessages(selectedTaskId)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedTaskId, fetchMessages, fetchDocuments, fetchAllLabels, fetchAllProfiles, fetchAgents, fetchSubtasks, fetchRelations])

  useEffect(() => {
    setIsEditingTitle(false)
    setIsEditingDesc(false)
    setStatusOpen(false)
    setPriorityOpen(false)
    setEstimateOpen(false)
    setLabelsOpen(false)
    setAssigneesOpen(false)
  }, [selectedTaskId])

  if (!task) return null

  const handleStatusChange = async (newStatus: TaskStatus) => {
    setStatusOpen(false)
    updateTask(task.id, { status: newStatus })
    const supabase = createClient()
    await supabase.from('tasks').update({ status: newStatus }).eq('id', task.id)
  }

  const handlePriorityChange = async (newPriority: TaskPriority) => {
    setPriorityOpen(false)
    updateTask(task.id, { priority: newPriority })
    const supabase = createClient()
    await supabase.from('tasks').update({ priority: newPriority }).eq('id', task.id)
  }

  const handleEstimateChange = async (newEstimate: number | null) => {
    setEstimateOpen(false)
    updateTask(task.id, { estimate: newEstimate })
    const supabase = createClient()
    await supabase.from('tasks').update({ estimate: newEstimate }).eq('id', task.id)
  }

  const handleDueDateChange = async (dateStr: string) => {
    const dueAt = dateStr ? new Date(dateStr).toISOString() : null
    updateTask(task.id, { due_at: dueAt })
    const supabase = createClient()
    await supabase.from('tasks').update({ due_at: dueAt }).eq('id', task.id)
  }

  const handleTitleSave = async () => {
    if (!editTitle.trim() || editTitle.trim() === task.title) {
      setIsEditingTitle(false)
      return
    }
    const trimmed = editTitle.trim()
    updateTask(task.id, { title: trimmed })
    setIsEditingTitle(false)
    const supabase = createClient()
    await supabase.from('tasks').update({ title: trimmed }).eq('id', task.id)
  }

  const handleDescSave = async () => {
    if (editDesc === task.description) {
      setIsEditingDesc(false)
      return
    }
    updateTask(task.id, { description: editDesc })
    setIsEditingDesc(false)
    const supabase = createClient()
    await supabase.from('tasks').update({ description: editDesc }).eq('id', task.id)
  }

  const handleToggleLabel = async (label: Label) => {
    const supabase = createClient()
    const currentLabels = task.labels ?? []
    const hasLabel = currentLabels.some((l) => l.id === label.id)

    if (hasLabel) {
      await supabase
        .from('task_labels')
        .delete()
        .eq('task_id', task.id)
        .eq('label_id', label.id)
      updateTask(task.id, { labels: currentLabels.filter((l) => l.id !== label.id) })
    } else {
      await supabase.from('task_labels').insert({ task_id: task.id, label_id: label.id })
      updateTask(task.id, { labels: [...currentLabels, label] })
    }
  }

  const handleToggleAssignee = async (profile: Profile) => {
    const supabase = createClient()
    const currentAssignees = task.assignees ?? []
    const isAssigned = currentAssignees.some((a) => a.id === profile.id)

    if (isAssigned) {
      await supabase
        .from('task_assignees')
        .delete()
        .eq('task_id', task.id)
        .eq('profile_id', profile.id)
      updateTask(task.id, { assignees: currentAssignees.filter((a) => a.id !== profile.id) })
    } else {
      await supabase.from('task_assignees').insert({ task_id: task.id, profile_id: profile.id })
      updateTask(task.id, { assignees: [...currentAssignees, profile] })
    }
  }

  const handlePostComment = async () => {
    if (!commentText.trim() || !commentAgent || sendingComment) return
    setSendingComment(true)
    const supabase = createClient()
    await supabase.from('messages').insert({
      task_id: task.id,
      from_agent_id: commentAgent,
      content: commentText.trim(),
    })
    setCommentText('')
    setSendingComment(false)
  }

  const handleAddSubtask = async () => {
    if (!newSubtaskTitle.trim()) return
    setAddingSubtask(true)
    const supabase = createClient()
    const { data } = await supabase.from('tasks').insert({
      title: newSubtaskTitle.trim(),
      parent_task_id: task.id,
      status: 'backlog' as TaskStatus,
      position: subtasks.length,
    }).select('*').single()
    if (data) {
      setSubtasks((prev) => [...prev, data as Task])
    }
    setNewSubtaskTitle('')
    setAddingSubtask(false)
  }

  const handleToggleSubtask = async (subtask: Task) => {
    const newStatus: TaskStatus = subtask.status === 'done' ? 'backlog' : 'done'
    setSubtasks((prev) => prev.map((s) => s.id === subtask.id ? { ...s, status: newStatus } : s))
    const supabase = createClient()
    await supabase.from('tasks').update({ status: newStatus }).eq('id', subtask.id)
  }

  const handleResumeAgent = async () => {
    // Agent resume disabled — agent system removed from UI
    return
  }

  const handleMarkDone = () => handleStatusChange('done')
  const handleArchive = () => handleStatusChange('archived')

  const priorityConfig = PRIORITY_CONFIG[task.priority ?? 0]
  const statusConfig = STATUS_CONFIG[task.status]
  const dueDateStr = formatDueDate(task.due_at)
  const dueDateColor = getDueDateColor(task.due_at)
  const dueDateInputValue = task.due_at
    ? new Date(task.due_at).toISOString().split('T')[0]
    : ''
  const taskId = `MC-${task.sequence_number}`
  const [copiedId, setCopiedId] = useState(false)

  const handleCopyId = async () => {
    await navigator.clipboard.writeText(taskId)
    setCopiedId(true)
    setTimeout(() => setCopiedId(false), 1500)
  }

  return (
    <>
      {/* Backdrop — click outside closes */}
      <div
        className="fixed inset-0 bg-black/60 z-50"
        onClick={() => selectTask(null)}
      />

      {/* Centered modal panel */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <aside
          className="pointer-events-auto w-full max-w-2xl max-h-[85vh] bg-[#12121a] border border-white/[0.1] rounded-2xl shadow-2xl shadow-black/60 flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
        {/* Specular rim */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-t-2xl" />

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <span className={`text-sm leading-none ${statusConfig.color}`}>{statusConfig.icon}</span>
            <button
              onClick={handleCopyId}
              className="flex items-center gap-1 text-xs font-mono text-white/50 hover:text-white/80 transition-colors"
              title="Copy task ID"
            >
              {taskId}
              <Copy size={10} className={copiedId ? 'text-emerald-400' : 'text-white/30'} />
            </button>
            <span className="text-white/10">|</span>
            <span className={`text-sm ${priorityConfig.color}`}>{priorityConfig.icon}</span>
          </div>
          <button
            onClick={() => selectTask(null)}
            className="p-1.5 rounded-lg hover:bg-white/[0.08] text-white/40 hover:text-white/80 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content - scrollable */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-4 space-y-4">
            {/* Title */}
            <div>
              {isEditingTitle ? (
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={handleTitleSave}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleTitleSave()
                    if (e.key === 'Escape') setIsEditingTitle(false)
                  }}
                  autoFocus
                  className="w-full bg-white/[0.06] border border-white/[0.12] rounded-lg px-3 py-2 text-base font-semibold text-white outline-none focus:border-white/[0.2]"
                />
              ) : (
                <h3
                  onClick={() => {
                    setEditTitle(task.title)
                    setIsEditingTitle(true)
                  }}
                  className="text-base font-semibold text-white cursor-text hover:bg-white/[0.04] rounded-lg px-1 py-0.5 -mx-1 transition-colors"
                >
                  {task.title}
                </h3>
              )}
            </div>

            {/* Properties Grid */}
            <div className="space-y-2">
              {/* Status */}
              <div className="flex items-center gap-3">
                <span className="text-[11px] uppercase tracking-widest text-white/40 w-20 flex-shrink-0">Status</span>
                <div className="relative flex-1">
                  <button
                    onClick={() => setStatusOpen(!statusOpen)}
                    className="w-full flex items-center justify-between bg-white/[0.06] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-white/80 hover:bg-white/[0.08] transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${STATUS_OPTIONS.find((o) => o.value === task.status)?.color}`} />
                      {STATUS_OPTIONS.find((o) => o.value === task.status)?.label}
                    </span>
                    <ChevronDown size={12} className={`text-white/40 transition-transform ${statusOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {statusOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-[#15151f] border border-white/[0.1] rounded-lg overflow-hidden z-10 shadow-xl shadow-black/40">
                      {STATUS_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleStatusChange(option.value)}
                          className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 transition-colors
                            ${task.status === option.value ? 'bg-white/[0.08] text-white' : 'text-white/60 hover:bg-white/[0.06] hover:text-white/80'}
                          `}
                        >
                          <span className={`w-2 h-2 rounded-full ${option.color}`} />
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Priority */}
              <div className="flex items-center gap-3">
                <span className="text-[11px] uppercase tracking-widest text-white/40 w-20 flex-shrink-0 flex items-center gap-1">
                  <Gauge size={10} />
                  Priority
                </span>
                <div className="relative flex-1">
                  <button
                    onClick={() => setPriorityOpen(!priorityOpen)}
                    className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs border border-white/[0.08] hover:bg-white/[0.08] transition-colors ${priorityConfig.bgColor} ${priorityConfig.color}`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span>{priorityConfig.icon}</span>
                      {priorityConfig.label}
                    </span>
                    <ChevronDown size={12} className={`text-white/40 transition-transform ${priorityOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {priorityOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-[#15151f] border border-white/[0.1] rounded-lg overflow-hidden z-10 shadow-xl shadow-black/40">
                      {([0, 1, 2, 3, 4] as TaskPriority[]).map((p) => {
                        const cfg = PRIORITY_CONFIG[p]
                        return (
                          <button
                            key={p}
                            onClick={() => handlePriorityChange(p)}
                            className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 transition-colors
                              ${task.priority === p ? 'bg-white/[0.08]' : 'hover:bg-white/[0.06]'}
                              ${cfg.color}
                            `}
                          >
                            <span>{cfg.icon}</span>
                            {cfg.label}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Due Date */}
              <div className="flex items-center gap-3">
                <span className="text-[11px] uppercase tracking-widest text-white/40 w-20 flex-shrink-0 flex items-center gap-1">
                  <Calendar size={10} />
                  Due
                </span>
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="date"
                    value={dueDateInputValue}
                    onChange={(e) => handleDueDateChange(e.target.value)}
                    className="flex-1 bg-white/[0.06] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-white/80 outline-none focus:border-white/[0.2] [color-scheme:dark]"
                  />
                  {dueDateStr && (
                    <span className={`text-[10px] flex-shrink-0 ${dueDateColor}`}>
                      {dueDateStr}
                    </span>
                  )}
                </div>
              </div>

              {/* Estimate */}
              <div className="flex items-center gap-3">
                <span className="text-[11px] uppercase tracking-widest text-white/40 w-20 flex-shrink-0 flex items-center gap-1">
                  <Clock size={10} />
                  Estimate
                </span>
                <div className="relative flex-1">
                  <button
                    onClick={() => setEstimateOpen(!estimateOpen)}
                    className="w-full flex items-center justify-between bg-white/[0.06] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-white/80 hover:bg-white/[0.08] transition-colors"
                  >
                    {task.estimate ? `${task.estimate} pts` : 'No estimate'}
                    <ChevronDown size={12} className={`text-white/40 transition-transform ${estimateOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {estimateOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-[#15151f] border border-white/[0.1] rounded-lg overflow-hidden z-10 shadow-xl shadow-black/40">
                      {ESTIMATE_OPTIONS.map((opt) => (
                        <button
                          key={opt.value ?? 'none'}
                          onClick={() => handleEstimateChange(opt.value)}
                          className={`w-full text-left px-3 py-2 text-xs transition-colors
                            ${task.estimate === opt.value ? 'bg-white/[0.08] text-white' : 'text-white/60 hover:bg-white/[0.06] hover:text-white/80'}
                          `}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Labels */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] uppercase tracking-widest text-white/40 flex items-center gap-1">
                  <Tag size={10} />
                  Labels
                </label>
                <button
                  onClick={() => setLabelsOpen(!labelsOpen)}
                  className="text-[10px] text-white/30 hover:text-white/60 transition-colors"
                >
                  {labelsOpen ? 'Close' : '+ Add'}
                </button>
              </div>
              {(task.labels ?? []).length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {(task.labels ?? []).map((label) => (
                    <span
                      key={label.id}
                      className="text-[10px] px-2 py-0.5 rounded-full border border-white/[0.08] flex items-center gap-1"
                      style={{ backgroundColor: `${label.color}20`, color: label.color }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: label.color }} />
                      {label.name}
                    </span>
                  ))}
                </div>
              )}
              {labelsOpen && (
                <div className="bg-[#15151f] border border-white/[0.1] rounded-lg overflow-hidden shadow-xl shadow-black/40">
                  {allLabels.map((label) => {
                    const isActive = (task.labels ?? []).some((l) => l.id === label.id)
                    return (
                      <button
                        key={label.id}
                        onClick={() => handleToggleLabel(label)}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 transition-colors
                          ${isActive ? 'bg-white/[0.08]' : 'hover:bg-white/[0.06]'}
                        `}
                      >
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: label.color }} />
                        <span className="text-white/70">{label.name}</span>
                        {isActive && <CheckCircle2 size={12} className="ml-auto text-emerald-400" />}
                      </button>
                    )
                  })}
                  {allLabels.length === 0 && (
                    <p className="text-xs text-white/30 px-3 py-2">No labels created</p>
                  )}
                </div>
              )}
            </div>

            {/* Sub-tasks */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] uppercase tracking-widest text-white/40 flex items-center gap-1">
                  <ListTree size={10} />
                  Sub-tasks
                </label>
                {subtasks.length > 0 && (
                  <span className="text-[10px] text-white/30">
                    {subtasks.filter((s) => s.status === 'done').length}/{subtasks.length}
                  </span>
                )}
              </div>

              {/* Progress bar */}
              {subtasks.length > 0 && (
                <div className="w-full h-1 bg-white/[0.06] rounded-full mb-2 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500/60 rounded-full transition-all"
                    style={{ width: `${(subtasks.filter((s) => s.status === 'done').length / subtasks.length) * 100}%` }}
                  />
                </div>
              )}

              {/* Subtask list */}
              {subtasks.length > 0 && (
                <div className="space-y-0.5 mb-2">
                  {subtasks.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => handleToggleSubtask(sub)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.04] transition-colors text-left group"
                    >
                      {sub.status === 'done' ? (
                        <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
                      ) : (
                        <Circle size={14} className="text-white/20 group-hover:text-white/40 flex-shrink-0" />
                      )}
                      <span className={`text-xs truncate ${sub.status === 'done' ? 'text-white/30 line-through' : 'text-white/70'}`}>
                        {sub.title}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Add subtask */}
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddSubtask()
                  }}
                  placeholder="Add sub-task..."
                  className="flex-1 bg-white/[0.06] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-white/80 placeholder:text-white/20 outline-none focus:border-white/[0.15]"
                />
                <button
                  onClick={handleAddSubtask}
                  disabled={!newSubtaskTitle.trim() || addingSubtask}
                  className="p-1.5 rounded-lg bg-white/[0.06] text-white/40 hover:bg-white/[0.1] hover:text-white/70 transition-colors disabled:opacity-30"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Relations */}
            {relations.length > 0 && (
              <div>
                <label className="text-[11px] uppercase tracking-widest text-white/40 mb-1.5 flex items-center gap-1">
                  <Link2 size={10} />
                  Relations
                </label>
                <div className="space-y-1">
                  {relations.map((rel) => (
                    <button
                      key={rel.id}
                      onClick={() => selectTask(rel.target_task_id)}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.06] transition-colors text-left"
                    >
                      <span className="text-[10px] text-white/30 uppercase w-16 flex-shrink-0">
                        {rel.relation_type.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-white/60 truncate">{rel.task.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] uppercase tracking-widest text-white/40">
                  Description
                </label>
                {task.description && !isEditingDesc && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setDescPreview(!descPreview)}
                      className={`p-1 rounded transition-colors ${descPreview ? 'text-white/50 hover:text-white/70' : 'text-white/25 hover:text-white/40'}`}
                      title={descPreview ? 'Show raw markdown' : 'Show preview'}
                    >
                      {descPreview ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(task.description || '')
                        setDescCopied(true)
                        setTimeout(() => setDescCopied(false), 2000)
                      }}
                      className="p-1 rounded text-white/25 hover:text-white/40 transition-colors"
                      title="Copy as markdown"
                    >
                      {descCopied ? <ClipboardCheck size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>
                  </div>
                )}
              </div>
              {isEditingDesc ? (
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  onBlur={handleDescSave}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setIsEditingDesc(false)
                  }}
                  autoFocus
                  rows={8}
                  className="w-full bg-white/[0.06] border border-white/[0.12] rounded-lg px-3 py-2 text-sm text-white/80 outline-none focus:border-white/[0.2] resize-y font-mono"
                />
              ) : descPreview && task.description ? (
                <div
                  onClick={() => {
                    setEditDesc(task.description)
                    setIsEditingDesc(true)
                  }}
                  className="text-sm text-white/60 cursor-text hover:bg-white/[0.04] rounded-lg px-2 py-1.5 -mx-1 transition-colors min-h-[3rem] md-preview"
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{task.description}</ReactMarkdown>
                </div>
              ) : (
                <p
                  onClick={() => {
                    setEditDesc(task.description)
                    setIsEditingDesc(true)
                  }}
                  className="text-sm text-white/60 cursor-text hover:bg-white/[0.04] rounded-lg px-2 py-1.5 -mx-1 transition-colors min-h-[3rem] whitespace-pre-wrap"
                >
                  {task.description || 'No description. Click to add.'}
                </p>
              )}
            </div>

            {/* Assignees */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] uppercase tracking-widest text-white/40">
                  Assignees
                </label>
                <button
                  onClick={() => setAssigneesOpen(!assigneesOpen)}
                  className="text-[10px] text-white/30 hover:text-white/60 transition-colors"
                >
                  {assigneesOpen ? 'Close' : '+ Add'}
                </button>
              </div>
              {task.assignees.length > 0 && (
                <div className="space-y-1.5 mb-2">
                  {task.assignees.map((profile) => (
                    <div
                      key={profile.id}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/[0.04]"
                    >
                      {profile.avatar_url ? (
                        <img src={profile.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-white/[0.1] flex items-center justify-center text-sm text-white/60">
                          {(profile.full_name ?? '?')[0]}
                        </div>
                      )}
                      <div className="min-w-0">
                        <span className="text-sm text-white truncate block">{profile.full_name ?? 'User'}</span>
                        <span className="text-[11px] text-white/40">{profile.email}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {assigneesOpen && (
                <div className="bg-[#15151f] border border-white/[0.1] rounded-lg overflow-hidden shadow-xl shadow-black/40">
                  {allProfiles.map((profile) => {
                    const isActive = task.assignees.some((a) => a.id === profile.id)
                    return (
                      <button
                        key={profile.id}
                        onClick={() => handleToggleAssignee(profile)}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 transition-colors
                          ${isActive ? 'bg-white/[0.08]' : 'hover:bg-white/[0.06]'}
                        `}
                      >
                        {profile.avatar_url ? (
                          <img src={profile.avatar_url} alt="" className="w-5 h-5 rounded-full object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-white/[0.1] flex items-center justify-center text-[10px] text-white/60 flex-shrink-0">
                            {(profile.full_name ?? '?')[0]}
                          </div>
                        )}
                        <span className="text-white/70">{profile.full_name ?? profile.email ?? 'User'}</span>
                        {isActive && <CheckCircle2 size={12} className="ml-auto text-emerald-400" />}
                      </button>
                    )
                  })}
                  {allProfiles.length === 0 && (
                    <p className="text-xs text-white/30 px-3 py-2">No profiles found</p>
                  )}
                </div>
              )}
            </div>

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <div>
                <label className="text-[11px] uppercase tracking-widest text-white/40 mb-1.5 block">
                  Tags
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {task.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-1 rounded-md bg-white/[0.06] text-white/60 border border-white/[0.06]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Resume Agent — for tasks with assignees in backlog/todo */}
            {task.assignees.length > 0 && ['backlog', 'todo'].includes(task.status) && (
              <div className="space-y-2">
                <button
                  onClick={handleResumeAgent}
                  disabled={resumingAgent}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold
                    bg-gradient-to-r from-blue-500/15 to-purple-500/15
                    text-blue-300 border border-blue-500/25
                    hover:from-blue-500/20 hover:to-purple-500/20
                    transition-all disabled:opacity-40"
                >
                  {resumingAgent ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Play size={14} />
                  )}
                  {resumingAgent ? 'Resuming...' : `Resume ${task.assignees[0].full_name ?? 'Agent'}`}
                </button>
                {resumeResult && (
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs ${
                    resumeResult.ok
                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                      : 'bg-red-500/10 border border-red-500/20 text-red-400'
                  }`}>
                    {resumeResult.ok ? <CheckCircle size={12} /> : <X size={12} />}
                    {resumeResult.message}
                  </div>
                )}
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleMarkDone}
                disabled={task.status === 'done'}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium
                  bg-emerald-500/10 text-emerald-400 border border-emerald-500/20
                  hover:bg-emerald-500/15 transition-colors
                  disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <CheckCircle2 size={14} />
                Mark Done
              </button>
              <button
                onClick={handleArchive}
                disabled={task.status === 'archived'}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium
                  bg-white/[0.06] text-white/50 border border-white/[0.06]
                  hover:bg-white/[0.08] transition-colors
                  disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Archive size={14} />
                Archive
              </button>
            </div>

            {/* Messages Section */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare size={14} className="text-white/40" />
                <label className="text-[11px] uppercase tracking-widest text-white/40">
                  Messages
                </label>
                <span className="text-[10px] text-white/30 bg-white/[0.06] px-1.5 py-0.5 rounded-full">
                  {messages.length}
                </span>
              </div>
              {messages.length > 0 ? (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className="bg-white/[0.04] rounded-lg p-2.5 border border-white/[0.06]"
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        {msg.agents && (
                          <>
                            <span className="text-sm">{msg.agents.avatar}</span>
                            <span className="text-[11px] font-medium text-white/70">{msg.agents.name}</span>
                          </>
                        )}
                        {msg.created_at && (
                          <span className="text-[10px] text-white/30 ml-auto">
                            {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                      <div className="prose prose-invert prose-xs max-w-none text-white/60 [&_p]:text-xs [&_p]:leading-relaxed [&_p]:my-0.5 [&_code]:text-[10px] [&_code]:bg-white/[0.06] [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_pre]:bg-white/[0.04] [&_pre]:p-2 [&_pre]:rounded-lg [&_pre]:text-[10px] [&_a]:text-blue-400 [&_ul]:text-xs [&_ol]:text-xs [&_li]:my-0">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-white/20 italic px-1">No messages yet</p>
              )}

              {/* Comment input with @mention */}
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2">
                  <select
                    value={commentAgent}
                    onChange={(e) => setCommentAgent(e.target.value)}
                    className="bg-white/[0.06] border border-white/[0.08] rounded-lg px-2 py-1 text-[10px] text-white/60 outline-none"
                  >
                    {allAgents.map((a) => (
                      <option key={a.id} value={a.id}>{a.avatar} {a.name}</option>
                    ))}
                  </select>
                  <span className="text-[10px] text-white/20">Type @ to mention</span>
                </div>
                <div className="relative flex gap-2">
                  <div className="relative flex-1">
                    <textarea
                      value={commentText}
                      onChange={(e) => {
                        const val = e.target.value
                        setCommentText(val)
                        // Detect @mention
                        const cursor = e.target.selectionStart
                        const textBefore = val.slice(0, cursor)
                        const mentionMatch = textBefore.match(/@(\w*)$/)
                        if (mentionMatch) {
                          setMentionQuery(mentionMatch[1].toLowerCase())
                          setMentionIndex(0)
                        } else {
                          setMentionQuery(null)
                        }
                      }}
                      placeholder="Write a comment... (Markdown + @mentions)"
                      rows={2}
                      onKeyDown={(e) => {
                        if (mentionQuery !== null) {
                          const filtered = allAgents.filter((a) =>
                            a.name.toLowerCase().includes(mentionQuery)
                          )
                          if (e.key === 'ArrowDown') {
                            e.preventDefault()
                            setMentionIndex((i) => Math.min(i + 1, filtered.length - 1))
                            return
                          }
                          if (e.key === 'ArrowUp') {
                            e.preventDefault()
                            setMentionIndex((i) => Math.max(i - 1, 0))
                            return
                          }
                          if ((e.key === 'Enter' || e.key === 'Tab') && filtered.length > 0) {
                            e.preventDefault()
                            const agent = filtered[mentionIndex]
                            const cursor = e.currentTarget.selectionStart
                            const textBefore = commentText.slice(0, cursor)
                            const textAfter = commentText.slice(cursor)
                            const mentionStart = textBefore.lastIndexOf('@')
                            setCommentText(
                              textBefore.slice(0, mentionStart) + `@${agent.name} ` + textAfter
                            )
                            setMentionQuery(null)
                            return
                          }
                          if (e.key === 'Escape') {
                            setMentionQuery(null)
                            return
                          }
                        }
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                          e.preventDefault()
                          handlePostComment()
                        }
                      }}
                      className="w-full bg-white/[0.06] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-white/80 placeholder:text-white/20 outline-none focus:border-white/[0.15] resize-none"
                    />

                    {/* @Mention dropdown */}
                    {mentionQuery !== null && (() => {
                      const filtered = allAgents.filter((a) =>
                        a.name.toLowerCase().includes(mentionQuery)
                      )
                      if (filtered.length === 0) return null
                      return (
                        <div className="absolute bottom-full left-0 right-0 mb-1 bg-[#15151f] border border-white/[0.1] rounded-lg overflow-hidden z-20 shadow-xl shadow-black/40 max-h-32 overflow-y-auto">
                          {filtered.map((agent, i) => (
                            <button
                              key={agent.id}
                              onMouseDown={(e) => {
                                e.preventDefault()
                                const textarea = e.currentTarget.closest('.relative')?.querySelector('textarea')
                                if (!textarea) return
                                const cursor = textarea.selectionStart
                                const textBefore = commentText.slice(0, cursor)
                                const textAfter = commentText.slice(cursor)
                                const mentionStart = textBefore.lastIndexOf('@')
                                setCommentText(
                                  textBefore.slice(0, mentionStart) + `@${agent.name} ` + textAfter
                                )
                                setMentionQuery(null)
                              }}
                              className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 transition-colors
                                ${i === mentionIndex ? 'bg-white/[0.08] text-white' : 'text-white/60 hover:bg-white/[0.06]'}
                              `}
                            >
                              <span className="text-sm">{agent.avatar}</span>
                              <span>{agent.name}</span>
                              <span className="text-[10px] text-white/30 ml-auto">{agent.role}</span>
                            </button>
                          ))}
                        </div>
                      )
                    })()}
                  </div>
                  <button
                    onClick={handlePostComment}
                    disabled={!commentText.trim() || sendingComment}
                    className="self-end p-2 rounded-lg bg-white/[0.08] text-white/50 hover:bg-white/[0.12] hover:text-white/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Documents Section */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText size={14} className="text-white/40" />
                <label className="text-[11px] uppercase tracking-widest text-white/40">
                  Documents
                </label>
                <span className="text-[10px] text-white/30 bg-white/[0.06] px-1.5 py-0.5 rounded-full">
                  {documents.length}
                </span>
              </div>
              {documents.length > 0 ? (
                <div className="space-y-1.5">
                  {documents.map((doc) => (
                    <div key={doc.id}>
                      <button
                        onClick={() => setPreviewDocId(previewDocId === doc.id ? null : doc.id)}
                        className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg border transition-colors text-left
                          ${previewDocId === doc.id ? 'bg-white/[0.06] border-white/[0.1]' : 'bg-white/[0.04] border-white/[0.06] hover:bg-white/[0.06]'}
                        `}
                      >
                        <FileText size={14} className="text-white/30 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <span className="text-xs text-white/70 truncate block">{doc.title}</span>
                          <span className="text-[10px] text-white/30">
                            {doc.type}{doc.path ? ` - ${doc.path}` : ''}
                          </span>
                        </div>
                        <ChevronDown size={10} className={`text-white/30 transition-transform ${previewDocId === doc.id ? 'rotate-180' : ''}`} />
                      </button>
                      {previewDocId === doc.id && (
                        <div className="mt-1 px-3 py-2.5 bg-white/[0.02] border border-white/[0.06] rounded-lg">
                          {doc.type === 'code' ? (
                            <pre className="text-[10px] text-white/60 font-mono overflow-x-auto whitespace-pre-wrap">{doc.content}</pre>
                          ) : (
                            <div className="prose prose-invert prose-xs max-w-none text-white/60 [&_p]:text-xs [&_p]:leading-relaxed [&_p]:my-0.5 [&_code]:text-[10px] [&_code]:bg-white/[0.06] [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_pre]:bg-white/[0.04] [&_pre]:p-2 [&_pre]:rounded-lg [&_pre]:text-[10px] [&_a]:text-blue-400">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {doc.content}
                              </ReactMarkdown>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-white/20 italic px-1">No documents</p>
              )}
            </div>

            {/* Metadata */}
            <div className="border-t border-white/[0.06] pt-3 space-y-1">
              {task.created_at && (
                <div className="flex items-center justify-between text-[10px] text-white/25">
                  <span>Created</span>
                  <span>{formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}</span>
                </div>
              )}
              {task.updated_at && (
                <div className="flex items-center justify-between text-[10px] text-white/25">
                  <span>Updated</span>
                  <span>{formatDistanceToNow(new Date(task.updated_at), { addSuffix: true })}</span>
                </div>
              )}
              {task.session_key && (
                <div className="flex items-center justify-between text-[10px] text-white/25">
                  <span>Session</span>
                  <span className="font-mono">{task.session_key}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        </aside>
      </div>
    </>
  )
}
