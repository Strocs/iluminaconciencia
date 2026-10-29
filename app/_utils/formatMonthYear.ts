import { MONTHS } from './months'

const monthNames = Object.values(MONTHS)

export function formatMonthYear(publishedAt: string): string {
  const [year, month] = publishedAt.split('-')
  const monthName = monthNames[Number(month) - 1]

  return monthName ? `${monthName} del ${year}` : publishedAt
}
