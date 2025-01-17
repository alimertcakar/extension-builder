import { toDateString } from '@schedule-x/calendar'

import TimeUnits, { Month, MonthWeek, toIntegers } from '../../model'

const createWeekForMonth = (week: MonthWeek, day: Date) => {
  week.push({
    date: toDateString(day),
    events: {},
    backgroundEvents: [],
  })

  return week
}

export const createMonth = (date: string, timeUnitsImpl: TimeUnits) => {
  const { year, month: monthFromDate } = toIntegers(date)
  const monthWithDates = timeUnitsImpl.getMonthWithTrailingAndLeadingDays(
    year,
    // @ts-ignore
    monthFromDate
  )
  const month: Month = []

  for (const week of monthWithDates) {
    month.push(week.reduce(createWeekForMonth, [] as MonthWeek))
  }

  return month
}
