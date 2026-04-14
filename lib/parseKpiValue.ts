/**
 * KPI 표시 값 문자열을 숫자 + prefix/suffix로 분해.
 * 예: "1,234,000원" → { numeric: 1234000, prefix: "", suffix: "원" }
 *     "15명"        → { numeric: 15,      prefix: "", suffix: "명" }
 *     "82.5%"       → { numeric: 82.5,    prefix: "", suffix: "%" }
 */
export function parseKpiValue(value: string): {
  numeric: number
  prefix: string
  suffix: string
} {
  const match = value.match(/^([^0-9]*)([0-9,]+(?:\.[0-9]*)?)(.*)$/)
  if (!match) return { numeric: 0, prefix: '', suffix: value }
  return {
    prefix: match[1],
    numeric: parseFloat(match[2].replace(/,/g, '')),
    suffix: match[3],
  }
}
