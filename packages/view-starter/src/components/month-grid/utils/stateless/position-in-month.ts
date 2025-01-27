import { CalendarEventInternal } from '@schedule-x/shared'

import { DATE_GRID_BLOCKER, MonthDay, Month as MonthType, dateFromDateTime } from '../../../model'

const positionInMonthWeek = (
  sortedEvents: CalendarEventInternal[],
  week: Record<string, MonthDay>
) => {
  const weekDates = Object.keys(week).sort()
  const firstDateOfWeek = weekDates[0]
  const lastDateOfWeek = weekDates[weekDates.length - 1]
  const occupiedLevels = new Set<number>()

  for (const event of sortedEvents) {
    const eventOriginalStartDate = dateFromDateTime(event.start)
    const eventOriginalEndDate = dateFromDateTime(event.end)

    const isEventStartInWeek = !!week[eventOriginalStartDate]
    let isEventInWeek = isEventStartInWeek
    if (
      !isEventStartInWeek &&
      eventOriginalStartDate < firstDateOfWeek &&
      eventOriginalEndDate >= firstDateOfWeek
    ) {
      isEventInWeek = true
    }
    if (!isEventInWeek) continue

    const firstDateOfEvent = isEventStartInWeek
      ? eventOriginalStartDate
      : firstDateOfWeek
    const lastDateOfEvent =
      eventOriginalEndDate <= lastDateOfWeek
        ? eventOriginalEndDate
        : lastDateOfWeek

    const eventDays = Object.values(week).filter((day) => {
      return day.date >= firstDateOfEvent && day.date <= lastDateOfEvent
    })

    let levelInWeekForEvent
    let testLevel = 0

    while (levelInWeekForEvent === undefined) {
      const isLevelFree = eventDays.every((day) => {
        return !day.events[testLevel]
      })
      if (isLevelFree) {
        levelInWeekForEvent = testLevel
        occupiedLevels.add(testLevel)
      } else testLevel++
    }

    for (const [eventDayIndex, eventDay] of eventDays.entries()) {
      if (eventDayIndex === 0) {
        event._eventFragments[firstDateOfEvent] = eventDays.length
        eventDay.events[levelInWeekForEvent] = event
      } else {
        eventDay.events[levelInWeekForEvent] = DATE_GRID_BLOCKER
      }
    }
  }

  for (const level of Array.from(occupiedLevels)) {
    for (const [, day] of Object.entries(week)) {
      if (!day.events[level]) {
        day.events[level] = undefined
      }
    }
  }

  return week
}

export const positionInMonth = (
  month: MonthType,
  sortedEvents: CalendarEventInternal[]
) => {
  const weeks: Record<string, MonthDay>[] = []
  month.forEach((week) => {
    const weekMap: Record<string, MonthDay> = {}
    week.forEach((day) => (weekMap[day.date] = day))
    weeks.push(weekMap)
  })
  weeks.forEach((week) => positionInMonthWeek(sortedEvents, week))

  return month
}
