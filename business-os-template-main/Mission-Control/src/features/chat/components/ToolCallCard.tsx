'use client'
import { Loader2, Check, Wrench } from 'lucide-react'
import type { ToolCall } from '../hooks/useChat'

const TOOL_LABELS: Record<string, string> = {
  Read: 'Reading file',
  Write: 'Writing file',
  Edit: 'Editing file',
  Bash: 'Running command',
  Glob: 'Finding files',
  Grep: 'Searching code',
  WebSearch: 'Web search',
  WebFetch: 'Loading page',
  Agent: 'Delegating to subagent',
  Skill: 'Running skill',
}

function getToolLabel(toolName: string): string {
  // Handle MCP tools like mcp__supabase__execute_sql
  if (toolName.startsWith('mcp__')) {
    const parts = toolName.split('__')
    return parts.length >= 3 ? `${parts[1]}: ${parts.slice(2).join(' ')}` : toolName
  }
  return TOOL_LABELS[toolName] ?? toolName
}

export function ToolCallCards({ tools }: { tools: ToolCall[] }) {
  if (!tools.length) return null

  return (
    <div className="flex flex-wrap gap-1.5 my-1.5">
      {tools.map((tool) => (
        <span
          key={tool.toolId}
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium transition-all duration-300
            ${tool.status === 'running'
              ? 'bg-violet-500/15 border border-violet-500/20 text-violet-300'
              : 'bg-white/[0.04] border border-white/[0.06] text-white/40'
            }`}
        >
          {tool.status === 'running' ? (
            <Loader2 size={10} className="animate-spin" />
          ) : (
            <Check size={10} />
          )}
          {getToolLabel(tool.toolName)}
        </span>
      ))}
    </div>
  )
}

export function StreamingIndicator() {
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] text-violet-400/60">
      <Wrench size={10} className="animate-pulse" />
      Processing...
    </span>
  )
}
