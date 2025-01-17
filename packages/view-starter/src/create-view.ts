import {createPreactView, setRangeForMonth} from '@schedule-x/calendar'
import {addMonths} from '@schedule-x/shared'

import {MonthViewWrapper} from './components/MonthViewWrapper'
import { InternalViewName } from '.';

type PreactView = ReturnType<typeof createPreactView>

type ViewFactory = () => PreactView;

export type PreactViewComponent = ReturnType<
  typeof createPreactView
>['Component']

export const createMonthView: ViewFactory = () => createPreactView({
  name: InternalViewName.MonthGrid,
  label: 'Test',
  setDateRange: setRangeForMonth,
  Component: MonthViewWrapper,
  hasWideScreenCompat: true,
  hasSmallScreenCompat: false,
  backwardForwardFn: addMonths,
  backwardForwardUnits: 1,
})
