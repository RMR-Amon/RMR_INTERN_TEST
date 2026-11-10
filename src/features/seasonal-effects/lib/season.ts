import type { Season } from '@/types'

/** Season by the user's LOCAL date (northern hemisphere, Uzbekistan). */
export const getSeasonForDate = (date: Date = new Date()): Season => {
  const month = date.getMonth() // 0 = January
  if (month >= 2 && month <= 4) return 'spring'
  if (month >= 5 && month <= 7) return 'summer'
  if (month >= 8 && month <= 10) return 'autumn'
  return 'winter'
}

export const SEASONS: Season[] = ['spring', 'summer', 'autumn', 'winter']
