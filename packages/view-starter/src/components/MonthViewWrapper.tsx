import { useSignalEffect } from '@preact/signals'
import { useState } from 'preact/hooks'

import { PreactViewComponent } from "../create-view";
import { Month, filterByRange, sortEventsByStartAndEndWithoutConsideringTime } from "./model";
import MonthGridWeek from './MonthGridWeek';
import { createMonth } from "./util/stateless/create-month";
import { positionInMonth } from './util/stateless/position-in-month';

export const MonthViewWrapper: PreactViewComponent = ({ $app, id }) => {
  const [month, setMonth] = useState<Month>([])

  useSignalEffect(() => {
    $app.calendarEvents.list.value.forEach((event) => {
      event._eventFragments = {}
    })
    const newMonth = createMonth(
      $app.datePickerState.selectedDate.value,
      // @ts-ignore
      $app.timeUnitsImpl
    )
    newMonth.forEach((week) => {
      week.forEach((day) => {
        day.backgroundEvents = filterByRange(
          // @ts-ignore
          $app.calendarEvents.backgroundEvents.value,
          {
            start: day.date,
            end: day.date,
          }
        )
      })
    })
    const filteredEvents = $app.calendarEvents.filterPredicate.value
      ? $app.calendarEvents.list.value.filter(
          $app.calendarEvents.filterPredicate.value
        )
      : $app.calendarEvents.list.value
    setMonth(
      positionInMonth(
        newMonth,
        filteredEvents.sort(sortEventsByStartAndEndWithoutConsideringTime)
      )
    )
  })

  // <AppContext.Provider value={$app}>
  // </AppContext.Provider> 
  return (
      <div id={id} className="sx__month-grid-wrapper">
        {month.map((week, index) => (
          <MonthGridWeek
           $app={$app}
            key={index}
            week={week}
            isFirstWeek={index === 0}
            isLastWeek={index === month.length - 1}
          />
        ))}
      </div>
  )
}
