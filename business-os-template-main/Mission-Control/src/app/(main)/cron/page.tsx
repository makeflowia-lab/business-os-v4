'use client'
import { CronJobList } from '@/features/cron/components'

export default function CronPage() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <CronJobList />
      </div>
    </div>
  )
}
