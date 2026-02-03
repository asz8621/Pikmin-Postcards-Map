import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return '-'

  try {
    const formattedDate = dayjs(date).format('YYYY-MM-DD HH:mm:ss')
    return formattedDate
  } catch {
    return '-'
  }
}

export const formatTimezone = (timezone = 'Asia/Taipei'): string => {
  const timestamp = new Date()
  try {
    const weekdayMap = ['日', '一', '二', '三', '四', '五', '六']
    const date = dayjs(timestamp).tz(timezone)
    const weekday = weekdayMap[date.day()]
    return `${date.format('YYYY-MM-DD HH:mm:ss')} (${weekday})`
  } catch {
    return '-'
  }
}
