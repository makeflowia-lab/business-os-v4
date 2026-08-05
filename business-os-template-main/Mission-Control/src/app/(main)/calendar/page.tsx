'use client'

import { CalendarHeader, CalendarGrid } from '@/features/calendar/components'
import { useCalendar } from '@/features/calendar/hooks/useCalendar'
import { Loader2 } from 'lucide-react'

export default function CalendarPage() {
  const {
    events,
    loading,
    currentDate,
    view,
    setView,
    accountFilter,
    setAccountFilter,
    goNext,
    goPrev,
    goToday,
  } = useCalendar()

  return (
    <div className="h-full p-4 md:p-6 flex flex-col">
      <CalendarHeader
        currentDate={currentDate}
        view={view}
        setView={setView}
        accountFilter={accountFilter}
        setAccountFilter={setAccountFilter}
        goNext={goNext}
        goPrev={goPrev}
        goToday={goToday}
      />

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={20} className="animate-spin text-white/30" />
        </div>
      ) : (
        <CalendarGrid
          currentDate={currentDate}
          events={events}
          view={view}
        />
      )}
    </div>
  )
}
