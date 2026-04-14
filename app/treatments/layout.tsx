import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "시술 기록 | 퀸즈헤나",
  description: "고객 시술 기록 조회 및 신규 시술 등록",
}

export default function TreatmentsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
