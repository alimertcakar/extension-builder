import { CalendarAppSingleton } from '@schedule-x/shared'
import { deepCloneEvent } from '@schedule-x/shared'
import { CalendarEventInternal } from '@schedule-x/shared'
import { useState } from 'preact/hooks'

export const isUIEventTouchEvent = (event: UIEvent): boolean => {
    return 'touches' in event && typeof event.touches === 'object'
  }
  
export default function useEventInteractions($app: CalendarAppSingleton) {
  const [eventCopy, setEventCopy] = useState<CalendarEventInternal>()
  const updateCopy = (newCopy: CalendarEventInternal | undefined) => {
    if (!newCopy) return setEventCopy(undefined)

    setEventCopy(deepCloneEvent(newCopy, $app))
  }

  const [dragStartTimeout, setDragStartTimeout] = useState<
    ReturnType<typeof setTimeout> | undefined
  >()

  const createDragStartTimeout = (
    callback: (uiEvent: UIEvent) => void,
    uiEvent: UIEvent
  ) => {
    setDragStartTimeout(setTimeout(() => callback(uiEvent), 150))
  }

  const setClickedEvent = (
    uiEvent: UIEvent,
    calendarEvent: CalendarEventInternal
  ) => {
    // For some reason, an event without touches is being triggered on touchend
    if (
      isUIEventTouchEvent(uiEvent) &&
      (uiEvent as TouchEvent).touches.length === 0
    )
      return
    if (!$app.config.plugins.eventModal) return

    const eventTarget = uiEvent.target
    if (!(eventTarget instanceof HTMLElement)) return

    const calendarEventElement = eventTarget.classList.contains('sx__event')
      ? eventTarget
      : eventTarget.closest('.sx__event')

    if (calendarEventElement instanceof HTMLElement) {
      $app.config.plugins.eventModal.calendarEventElement.value =
        calendarEventElement
      $app.config.plugins.eventModal.setCalendarEvent(
        calendarEvent,
        calendarEventElement.getBoundingClientRect()
      )
    }
  }

  const setClickedEventIfNotDragging = (
    calendarEvent: CalendarEventInternal,
    uiEvent: UIEvent
  ) => {
    if (dragStartTimeout) {
      clearTimeout(dragStartTimeout)
      setClickedEvent(uiEvent, calendarEvent)
    }
    setDragStartTimeout(undefined)
  }

  return {
    eventCopy,
    updateCopy,
    createDragStartTimeout,
    setClickedEventIfNotDragging,
    setClickedEvent,
  }
}
