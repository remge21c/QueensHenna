"use client";

import { 
  CalendarStar, 
  CurrencyKrw, 
  ChartBar, 
  UserPlus, 
  ClockCounterClockwise, 
  CaretRight,
  CheckCircle,
  WarningCircle,
  CalendarBlank,
  ChatText,
  PhoneCall
} from "@phosphor-icons/react";
import KpiCard from "@/components/ui/KpiCard";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      {/* 헤더 */}
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">대시보드</h1>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="font-semibold text-sm">이원장</div>
            <div className="text-xs text-muted">원장님 계정</div>
          </div>
          <div className="w-11 h-11 rounded-full bg-secondary text-white flex items-center justify-center font-bold text-lg">
            원
          </div>
        </div>
      </header>

      {/* KPI 섹션 */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title="오늘의 예약" value="8명" icon={CalendarStar} variant="primary" />
        <KpiCard title="오늘 매출" value="450,000원" icon={CurrencyKrw} variant="secondary" />
        <KpiCard title="이번 달 누적 매출" value="6,240,000원" icon={ChartBar} variant="secondary" />
        <KpiCard title="오늘 신규 고객" value="2명" icon={UserPlus} variant="primary" />
      </section>

      {/* 위젯 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* 메인 위젯 영역 (8/12) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* 오늘 예약 목록 카드 */}
          <div className="bg-surface rounded-lg card-shadow border border-border p-6 flex flex-col gap-5">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <ClockCounterClockwise weight="fill" className="text-primary" />
                오늘 예약 목록
              </h2>
              <Link href="/reservations" className="text-primary hover:text-primary-light text-sm font-medium flex items-center gap-1">
                전체보기 <CaretRight />
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-border text-muted text-[13px] font-medium uppercase tracking-wider">
                    <th className="text-left py-3 px-4">시간</th>
                    <th className="text-left py-3 px-4">고객명</th>
                    <th className="text-left py-3 px-4">연락처</th>
                    <th className="text-left py-3 px-4">상태</th>
                    <th className="text-left py-3 px-4">비고</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {[
                    { time: "10:00", name: "김미영", phone: "010-1234-5678", status: "방문완료", statusClass: "bg-primary/10 text-primary" },
                    { time: "11:30", name: "이현주", phone: "010-9876-5432", status: "대기", statusClass: "bg-secondary/20 text-[#B08D6A]" },
                    { time: "14:00", name: "박수진", phone: "010-5555-4444", status: "예약완료", statusClass: "bg-secondary/20 text-[#B08D6A]" },
                    { time: "16:00", name: "정유미", phone: "010-1111-2222", status: "예약완료", statusClass: "bg-secondary/20 text-[#B08D6A]", isNew: true },
                  ].map((res, i) => (
                    <tr key={i} className="border-b border-border hover:bg-black/5 transition-colors">
                      <td className="py-4 px-4 font-bold text-primary">{res.time}</td>
                      <td className="py-4 px-4">
                        {res.name} {res.isNew && <span className="text-xs text-muted ml-1">(신규)</span>}
                      </td>
                      <td className="py-4 px-4">{res.phone}</td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1.5 rounded-full text-[12px] font-bold ${res.statusClass}`}>
                          {res.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-muted">-</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 최근 시술 기록 카드 */}
          <div className="bg-surface rounded-lg card-shadow border border-border p-6 flex flex-col gap-5">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <CheckCircle weight="fill" className="text-primary" />
                최근 시술 기록
              </h2>
              <Link href="/treatments" className="text-primary hover:text-primary-light text-sm font-medium flex items-center gap-1">
                상세보기 <CaretRight />
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-border text-muted text-[13px] font-medium uppercase tracking-wider">
                    <th className="text-left py-3 px-4">완료시간</th>
                    <th className="text-left py-3 px-4">고객명</th>
                    <th className="text-left py-3 px-4">시술내용</th>
                    <th className="text-left py-3 px-4">결제금액</th>
                    <th className="text-left py-3 px-4">결제수단</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {[
                    { time: "11:45", name: "김미영", type: "기본 헤나 염색 + 두피케어", amount: "80,000원", method: "카드" },
                    { time: "어제 17:30", name: "최은지", type: "기본 헤나 염색", amount: "50,000원", method: "현금" },
                    { time: "어제 15:00", name: "강지원", type: "헤나 복구 염색", amount: "120,000원", method: "계좌이체" },
                  ].map((rec, i) => (
                    <tr key={i} className="border-b border-border hover:bg-black/5 transition-colors">
                      <td className="py-4 px-4">{rec.time}</td>
                      <td className="py-4 px-4 font-medium">{rec.name}</td>
                      <td className="py-4 px-4">{rec.type}</td>
                      <td className="py-4 px-4 font-bold">{rec.amount}</td>
                      <td className="py-4 px-4">{rec.method}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 사이드 위젯 영역 (4/12) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* 염색약 부족 알림 카드 */}
          <div className="bg-surface rounded-lg card-shadow border border-border p-6 flex flex-col gap-5">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <WarningCircle weight="fill" className="text-danger" />
              염색약 부족 (소진 임박)
            </h2>
            <div className="flex flex-col">
              {[
                { name: "오영희", rem: "0.5회분", status: "경고", color: "text-danger" },
                { name: "한지민", rem: "1.0회분", status: "주의", color: "text-[#D4A017]" },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center py-4 border-b border-border last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-danger/10 text-danger flex items-center justify-center font-bold text-sm">
                      {item.name[0]}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold">{item.name}</span>
                      <span className="text-xs text-muted">잔여: <span className={item.color}>{item.rem} ({item.status})</span></span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted hover:text-primary hover:border-primary transition-all">
                      <ChatText weight="fill" />
                    </button>
                    <button className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted hover:text-primary hover:border-primary transition-all">
                      <PhoneCall weight="fill" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 재방문 안내 카드 */}
          <div className="bg-surface rounded-lg card-shadow border border-border p-6 flex flex-col gap-5">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <CalendarBlank weight="fill" className="text-primary" />
              재방문 안내 권장
            </h2>
            <div className="flex flex-col">
              {[
                { name: "박영선", meta: "최근방문: 45일 전" },
                { name: "이정화", meta: "최근방문: 60일 전" },
                { name: "장미란", meta: "최근방문: 65일 전" },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center py-4 border-b border-border last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center font-bold text-sm">
                      {item.name[0]}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold">{item.name}</span>
                      <span className="text-xs text-muted">{item.meta}</span>
                    </div>
                  </div>
                  <button className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted hover:text-primary hover:border-primary transition-all">
                    <ChatText weight="fill" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
