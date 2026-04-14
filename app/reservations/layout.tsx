import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "예약 관리 | 퀸즈헤나",
  description: "고객 예약 일정 관리 및 신규 예약 등록",
}

export default function ReservationsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
