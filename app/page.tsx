import { getDashboardStats } from './dashboard/actions'
import DashboardContent from '@/components/dashboard/DashboardContent'

export default async function DashboardPage() {
  const stats = await getDashboardStats()
  return <DashboardContent stats={stats} />
}
