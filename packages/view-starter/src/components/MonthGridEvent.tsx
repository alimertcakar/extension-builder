/* eslint-disable max-lines */

import { CalendarEventInternal } from "@schedule-x/shared"
import { randomStringId } from "@schedule-x/shared"
import { CalendarAppSingleton } from "@schedule-x/shared"
import { useEffect } from "preact/hooks"

import { dateFromDateTime, dateTimeStringRegex, toIntegers } from "./model"
import useEventInteractions, { isUIEventTouchEvent } from "./model/useEventInteractions"

export const invokeOnEventClickCallback = (
  $app: CalendarAppSingleton,
  calendarEvent: CalendarEventInternal,
  e: UIEvent
) => {
  if ($app.config.callbacks.onEventClick) {
    // @ts-ignore
    $app.config.callbacks.onEventClick(calendarEvent._getExternalEvent(), e)
  }
}

export const invokeOnEventDoubleClickCallback = (
  $app: CalendarAppSingleton,
  calendarEvent: CalendarEventInternal,
  e: UIEvent
) => {
    // @ts-ignore
  if ($app.config.callbacks.onDoubleClickEvent) {
    // @ts-ignore
    $app.config.callbacks.onDoubleClickEvent(
      calendarEvent._getExternalEvent(),
      e
    )
  }
}

export const timeFn = (dateTimeString: string, locale: string) => {
  const { year, month, date, hours, minutes } = toIntegers(dateTimeString)

  return new Date(year, month, date, hours, minutes).toLocaleTimeString(
    locale,
    {
      hour: 'numeric',
      minute: 'numeric',
    }
  )
}

export const nextTick = (cb: (...args: unknown[]) => unknown) => {
  setTimeout(() => {
    cb()
  })
}

type props = {
  gridRow: number
  calendarEvent: CalendarEventInternal
  date: string
  isFirstWeek: boolean
  isLastWeek: boolean
  $app: any
}

/**
 * Get an element in the DOM by their custom component id
 * */
export const getElementByCCID = (customComponentId: string | undefined) =>
  document.querySelector(`[data-ccid="${customComponentId}"]`) as HTMLElement

export const focusModal = ($app: CalendarAppSingleton) => {
  const calendarWrapper = $app.elements.calendarWrapper
  if (!(calendarWrapper instanceof HTMLElement)) return
  const eventModal = calendarWrapper.querySelector('.sx__event-modal')
  if (!(eventModal instanceof HTMLElement)) return

  setTimeout(() => {
    eventModal.focus()
  }, 100)
}

export default function MonthGridEvent({
  $app,
  gridRow,
  calendarEvent,
  date,
  isFirstWeek,
  isLastWeek,
}: props) {
  const hasOverflowLeft =
    isFirstWeek &&
    $app.calendarState.range.value?.start &&
    dateFromDateTime(calendarEvent.start) <
      dateFromDateTime($app.calendarState.range.value.start)
  const hasOverflowRight =
    isLastWeek &&
    $app.calendarState.range.value?.end &&
    dateFromDateTime(calendarEvent.end) >
      dateFromDateTime($app.calendarState.range.value.end)
  const {
    createDragStartTimeout,
    setClickedEventIfNotDragging,
    setClickedEvent,
  } = useEventInteractions($app)

  const hasStartDate = dateFromDateTime(calendarEvent.start) === date
  const nDays = calendarEvent._eventFragments[date]

  const eventCSSVariables = {
    borderLeft: hasStartDate
      ? `4px solid var(--sx-color-${calendarEvent._color})`
      : undefined,
    color: `var(--sx-color-on-${calendarEvent._color}-container)`,
    backgroundColor: `var(--sx-color-${calendarEvent._color}-container)`,
    // CORRELATION ID: 2 (10px subtracted from width)
    // nDays * 100% for the width of each day + 1px for border - 10 px for horizontal gap between events
    width: `calc(${nDays * 100 + '%'} + ${nDays}px - 10px)`,
  } as const

  const handleStartDrag = (uiEvent: UIEvent) => {
    if (isUIEventTouchEvent(uiEvent)) uiEvent.preventDefault()
    if (!uiEvent.target) return
    if (!$app.config.plugins.dragAndDrop || calendarEvent._options?.disableDND)
      return

    $app.config.plugins.dragAndDrop.createMonthGridDragHandler(
      calendarEvent,
      $app
    )
  }

  const customComponent = $app.config._customComponentFns.monthGridEvent
  const customComponentId = customComponent
    ? 'custom-month-grid-event-' + randomStringId() // needs a unique string to support event recurrence
    : undefined

  useEffect(() => {
    if (!customComponent) return

    customComponent(getElementByCCID(customComponentId), {
      calendarEvent: calendarEvent._getExternalEvent(),
      hasStartDate,
    })
  }, [calendarEvent])

  const handleOnClick = (e: MouseEvent) => {
    e.stopPropagation() // prevent the click from bubbling up to the day element
    invokeOnEventClickCallback($app, calendarEvent, e)
  }

  const handleOnDoubleClick = (e: MouseEvent) => {
    e.stopPropagation() // prevent the click from bubbling up to the day element
    invokeOnEventDoubleClickCallback($app, calendarEvent, e)
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.stopPropagation()
      setClickedEvent(e, calendarEvent)
      invokeOnEventClickCallback($app, calendarEvent, e)
      nextTick(() => {
        focusModal($app)
      })
    }
  }

  const classNames = [
    'sx__event',
    'sx__month-grid-event',
    'sx__month-grid-cell',
  ]
  if (calendarEvent._options?.additionalClasses) {
    classNames.push(...calendarEvent._options.additionalClasses)
  }
  if (hasOverflowLeft) classNames.push('sx__month-grid-event--overflow-left')
  if (hasOverflowRight) classNames.push('sx__month-grid-event--overflow-right')

  const hasCustomContent = calendarEvent._customContent?.monthGrid

  return (
    <div
      draggable={!!$app.config.plugins.dragAndDrop}
      data-event-id={calendarEvent.id}
      data-ccid={customComponentId}
      onMouseDown={(e) => createDragStartTimeout(handleStartDrag, e)}
      onMouseUp={(e) => setClickedEventIfNotDragging(calendarEvent, e)}
      onTouchStart={(e) => createDragStartTimeout(handleStartDrag, e)}
      onTouchEnd={(e) => setClickedEventIfNotDragging(calendarEvent, e)}
      onClick={handleOnClick}
      onDblClick={handleOnDoubleClick}
      onKeyDown={handleKeyDown}
      className={classNames.join(' ')}
      style={{
        gridRow,
        width: eventCSSVariables.width,
        padding: customComponent ? '0px' : undefined,
        borderLeft: customComponent ? undefined : eventCSSVariables.borderLeft,
        color: customComponent ? undefined : eventCSSVariables.color,
        backgroundColor: customComponent
          ? undefined
          : eventCSSVariables.backgroundColor,
      }}
      tabIndex={0}
      role="button"
    >
      {!customComponent && !hasCustomContent && (
        <>
          {dateTimeStringRegex.test(calendarEvent.start) && (
            <div className="sx__month-grid-event-time">
              {timeFn(calendarEvent.start, $app.config.locale.value)}
            </div>
          )}

          <div className="sx__month-grid-event-title">
            {calendarEvent.title}
          </div>
        </>
      )}

      {hasCustomContent && (
        <div
          dangerouslySetInnerHTML={{
            __html: calendarEvent._customContent?.monthGrid || '',
          }}
        />
      )}
    </div>
  )
}
