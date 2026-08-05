'use client'

import { useState } from 'react'
import { Tags, Bot, Calculator, UserCircle, Loader2 } from 'lucide-react'
import { useAdminConfig } from '@/features/admin/hooks/useAdminConfig'
import { CategoryManager } from '@/features/admin/components/CategoryManager'
import { AgentPromptEditor } from '@/features/admin/components/AgentPromptEditor'
import { CalculatorSettings } from '@/features/admin/components/CalculatorSettings'
import { AccountSection } from '@/features/admin/components/AccountSection'

type TabId = 'categories' | 'agent' | 'calculator' | 'account'

interface Tab {
  id: TabId
  label: string
  icon: React.ReactNode
}

const TABS: Tab[] = [
  { id: 'categories', label: 'Categorias', icon: <Tags className="w-4 h-4" /> },
  { id: 'agent', label: 'CFO Agent', icon: <Bot className="w-4 h-4" /> },
  { id: 'calculator', label: 'Calculadora', icon: <Calculator className="w-4 h-4" /> },
  { id: 'account', label: 'Cuenta', icon: <UserCircle className="w-4 h-4" /> },
]

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabId>('categories')
  const {
    config,
    isLoading,
    error,
    addCategory,
    removeCategory,
    updateCategory,
    resetCategories,
    updateAgentPrompt,
    updateCalculatorDefaults,
  } = useAdminConfig()

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      )
    }

    if (error) {
      return (
        <div className="p-6 bg-red-50 text-red-600 rounded-xl">
          Error: {error}
        </div>
      )
    }

    if (!config) return null

    switch (activeTab) {
      case 'categories':
        return (
          <CategoryManager
            expenseCategories={config.expense_categories}
            incomeCategories={config.income_categories}
            onAddCategory={addCategory}
            onRemoveCategory={removeCategory}
            onUpdateCategory={updateCategory}
            onResetCategories={resetCategories}
          />
        )
      case 'agent':
        return (
          <AgentPromptEditor
            currentPrompt={config.agent_system_prompt}
            onSave={updateAgentPrompt}
          />
        )
      case 'calculator':
        return (
          <CalculatorSettings
            defaults={config.calculator_defaults}
            onSave={updateCalculatorDefaults}
          />
        )
      case 'account':
        return <AccountSection />
      default:
        return null
    }
  }

  return (
    <div className="p-6 pb-24 md:p-8 lg:pb-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Admin Panel</h1>
          <p className="text-gray-500 mt-1">
            Configura categorias, agente y calculadora
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap
                transition-all duration-200
                ${
                  activeTab === tab.id
                    ? 'bg-neu-bg shadow-neu-inset text-blue-600'
                    : 'bg-neu-bg shadow-neu text-gray-600 hover:shadow-neu-sm'
                }
              `}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-neu-bg shadow-neu rounded-2xl p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}
