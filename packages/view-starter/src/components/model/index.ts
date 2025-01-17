import { dateStringRegex } from '@schedule-x/shared'
import { CalendarEventInternal } from '@schedule-x/shared'
import { CSSProperties } from 'preact/compat'

export type WeekWithDates = Date[]
export type MonthWithDates = Date[][]

export type BackgroundEvent = {
  start: string
  end: string
  style: CSSProperties
  title?: string
}

type WeekDay = {
  date: string
  timeGridEvents: CalendarEventInternal[]
  dateGridEvents: {
    [key: string]: CalendarEventInternal | typeof DATE_GRID_BLOCKER | undefined
  }
  backgroundEvents: BackgroundEvent[]
}

export default interface TimeUnits {
  firstDayOfWeek: WeekDay

  getMonthWithTrailingAndLeadingDays(year: number, month: Month): MonthWithDates
  getWeekFor(date: Date): WeekWithDates
  getMonthsFor(year: number): Date[]
}

export type DateTimeVariables = {
  year: number
  month: number
  date: number
  hours: number | undefined
  minutes: number | undefined
}

export const dateFromDateTime = (dateTime: string): string => {
  return dateTime.slice(0, 10)
}

export const DATE_GRID_BLOCKER = 'blocker'


export const toIntegers = (
    dateTimeSpecification: string
  ): DateTimeVariables => {
    const hours = dateTimeSpecification.slice(11, 13),
      minutes = dateTimeSpecification.slice(14, 16)
  
    return {
      year: Number(dateTimeSpecification.slice(0, 4)),
      month: Number(dateTimeSpecification.slice(5, 7)) - 1,
      date: Number(dateTimeSpecification.slice(8, 10)),
      hours: hours !== '' ? Number(hours) : undefined,
      minutes: minutes !== '' ? Number(minutes) : undefined,
    }
  }

export type MonthDay = {
  date: string
  events: Record<string, CalendarEventInternal | 'blocker' | undefined>
  backgroundEvents: BackgroundEvent[]
}

export type MonthWeek = MonthDay[]

export type Month = MonthWeek[]

export type DateRange = {
  start: string
  end: string
}


export const filterByRange = (
  events: BackgroundEvent[],
  range: DateRange
): BackgroundEvent[] => {
  return events.filter((event) => {
    let rangeStart = range.start
    let rangeEnd = range.end
    if (dateStringRegex
      .test(rangeStart)) rangeStart = rangeStart + ' 00:00'
    if (dateStringRegex.test(rangeEnd)) rangeEnd = rangeEnd + ' 23:59'

    let eventStart = event.start
    let eventEnd = event.end
    if (dateStringRegex.test(eventStart)) eventStart = eventStart + ' 00:00'
    if (dateStringRegex.test(eventEnd)) eventEnd = eventEnd + ' 23:59'

    const eventStartsInRange =
      eventStart >= rangeStart && eventStart <= rangeEnd
    const eventEndInRange = eventEnd >= rangeStart && eventEnd <= rangeEnd
    const eventStartBeforeAndEventEndAfterRange =
      eventStart < rangeStart && eventEnd > rangeEnd

    return (
      eventStartsInRange ||
      eventEndInRange ||
      eventStartBeforeAndEventEndAfterRange
    )
  })
}

export const sortEventsByStartAndEndWithoutConsideringTime = (
  a: CalendarEventInternal,
  b: CalendarEventInternal
) => {
  const aStart = dateFromDateTime(a.start)
  const bStart = dateFromDateTime(b.start)
  const aEnd = dateFromDateTime(a.end)
  const bEnd = dateFromDateTime(b.end)

  if (aStart === bStart) {
    if (aEnd < bEnd) return 1
    if (aEnd > bEnd) return -1
    return 0
  }

  if (aStart < bStart) return -1
  if (aStart > bStart) return 1
  return 0
}

const dateFn = (dateTimeString: string, locale: string) => {
  const { year, month, date } = toIntegers(dateTimeString)

  return new Date(year, month, date).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export const getLocalizedDate = dateFn

export enum InternalViewName {
  Day = 'day',
  Week = 'week',
  MonthGrid = 'month-grid',
  MonthAgenda = 'month-agenda',
}

export const isToday = (date: Date) => {
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

export const getClassNameForWeekday = (weekday: number): string => {
  switch (weekday) {
    case 0:
      return 'sx__sunday'
    case 1:
      return 'sx__monday'
    case 2:
      return 'sx__tuesday'
    case 3:
      return 'sx__wednesday'
    case 4:
      return 'sx__thursday'
    case 5:
      return 'sx__friday'
    case 6:
      return 'sx__saturday'
    default:
      throw new Error('Invalid weekday')
  }
}

export const getDayNameShort = (date: Date, locale: string) =>
  date.toLocaleString(locale, { weekday: 'short' })