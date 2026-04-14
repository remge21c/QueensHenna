import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "설정 | 퀸즈헤나",
  description: "시스템 설정, 데이터 백업 및 복원",
}

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
