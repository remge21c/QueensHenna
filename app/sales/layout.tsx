import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "매출 통계 | 퀸즈헤나",
  description: "월별 매출 현황 및 시술 통계 분석",
}

export default function SalesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
