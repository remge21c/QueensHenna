import { getTreatments } from './actions'
import TreatmentsClient from '@/components/treatments/TreatmentsClient'

export default async function TreatmentsPage() {
  const treatments = await getTreatments()
  return <TreatmentsClient treatments={treatments} />
}
