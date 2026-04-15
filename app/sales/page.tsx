import { getSalesStats } from './actions'
import SalesContent from '@/components/sales/SalesContent'
import { format } from 'date-fns'

export default async function SalesPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>
}) {
  const params = await searchParams
  const targetMonth = params.month ?? format(new Date(), 'yyyy-MM')
  const stats = await getSalesStats(targetMonth)
  return <SalesContent stats={stats} targetMonth={targetMonth} />
}
