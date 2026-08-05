import { DashboardOverview } from '@/features/dashboard/components/DashboardOverview';

export default function DashboardPage() {
  return (
    <main className="flex-1 w-full flex flex-col pt-4 sm:pt-6 lg:pt-10">
      <div className="app-container w-full animate-fade-in">
        <DashboardOverview />
      </div>
    </main>
  );
}
