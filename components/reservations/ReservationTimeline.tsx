'use client'

import React from 'react'
import { Badge } from '@/components/ui/Badge'
import { format, parseISO } from 'date-fns'
import { Plus } from '@phosphor-icons/react'

interface Reservation {
  id: string
  reserved_at: string
  status: string
  customer: { name: string }
  memo: string
}

interface ReservationTimelineProps {
  reservations: Reservation[]
  selectedDate: string
}

export default function ReservationTimeline({ reservations, selectedDate }: ReservationTimelineProps) {
  const slots = Array.from({ length: 12 }, (_, i) => i + 9)

  const getReservationsForSlot = (hour: number) => {
    return reservations.filter(res => {
      const date = parseISO(res.reserved_at)
      return date.getHours() === hour
    })
  }

  return (
    <div className="bg-card rounded-xl p-6 card-shadow border border-border mt-6">
      <div className="overflow-x-auto">
        <table className="w-full">
          <tbody>
            {slots.map(hour => {
              const slotReservations = getReservationsForSlot(hour)
              const timeLabel = `${hour.toString().padStart(2, '0')}:00`

              return (
                <tr key={hour} className="border-b border-surface-variant last:border-0 group/row">
                  <td className="py-4 md:py-6 pr-3 md:pr-6 font-semibold text-muted-foreground border-r border-surface-variant w-[60px] md:w-[100px] text-center align-top whitespace-nowrap text-sm md:text-base">
                    <div className="flex flex-col items-center gap-1">
                      <span>{timeLabel}</span>
                      {slotReservations.length >= 3 && (
                        <Badge variant="danger" className="text-[10px] px-1.5 py-0 animate-bounce">
                          겹침 주의
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="py-4 pl-3 md:pl-6 align-top">
                    {slotReservations.length > 0 ? (
                      <div className="grid gap-3">
                        {slotReservations.map(res => (
                          <div
                            key={res.id}
                            className="bg-primary/5 border-l-4 border-primary p-4 rounded-xl flex justify-between items-start hover:bg-primary/10 transition-colors cursor-pointer group/card"
                          >
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-foreground text-lg">{res.customer.name}</span>
                                <span className="text-sm font-medium text-muted-foreground">
                                  {format(parseISO(res.reserved_at), 'HH:mm')}
                                </span>
                              </div>
                              <p className="text-sm text-on-surface-variant leading-relaxed">{res.memo}</p>
                            </div>
                            <Badge
                              variant={res.status === '방문완료' ? 'secondary' : 'success'}
                              className="px-3 py-1 text-sm font-medium"
                            >
                              {res.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <button className="w-full border border-dashed border-border text-outline-variant text-sm py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-muted hover:border-primary hover:text-primary transition-all group/btn">
                        <Plus weight="bold" className="group-hover/btn:scale-110 transition-transform" />
                        <span>예약 추가</span>
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
