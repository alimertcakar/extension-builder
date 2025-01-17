import { addMonths } from '@schedule-x/shared/src/utils/stateless/time/date-time-mutation/adding'

import { setRangeForMonth } from '../../utils/stateless/time/range/set-range'
import { InternalViewName } from '../..'
import { MonthGridWrapper } from './components/month-grid-wrapper'

const config = {
  name: InternalViewName.MonthGrid,
  label: 'Month',
  setDateRange: setRangeForMonth,
  Component: MonthGridWrapper,
  hasWideScreenCompat: true,
  hasSmallScreenCompat: false,
  backwardForwardFn: addMonths,
  backwardForwardUnits: 1,
}
export const viewMonthGrid = createPreactView(config)
export const createViewMonthGrid = () => createPreactView(config)
