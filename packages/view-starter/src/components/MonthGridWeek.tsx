import { MonthWeek } from "./model"
import MonthGridDay from "./MonthGridDay"

type props = {
$app: any
  week: MonthWeek
  isFirstWeek: boolean
  isLastWeek: boolean
}

 export default function MonthGridWeek({
  $app,
  week,
  isFirstWeek,
  isLastWeek,
}: props) {
  return (
    <div className="sx__month-grid-week">
      {week.map((day) => {
        /**
         * The day component keeps internal state, and needs to be thrown away once the day changes.
         * */
        const dateKey = day.date
        return (
          <MonthGridDay
          $app={$app}
            key={dateKey}
            day={day}
            isFirstWeek={isFirstWeek}
            isLastWeek={isLastWeek}
          />
        )
      })}
    </div>
  )
}