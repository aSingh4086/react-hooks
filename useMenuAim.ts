import { MouseEvent, MouseEventHandler, RefObject, useRef, useState } from 'react'
import {
    clearCollectionRef,
    getNativeMousePosition,
    isMouseHoverWithinElement,
    isPointsInsideMovementArea,
} from './utils/mouseMovement.utils'

export const MAX_DELAY = 450
export const IDLE_STATE_DELAY = 150
export const useMouseMovementHook = ({
    _mouseHoverAreaRef,
    _aimedTargetRef,
    _callback,
}: {
    _mouseHoverAreaRef: RefObject<HTMLUListElement>
    _aimedTargetRef: RefObject<HTMLDivElement>
    _callback: (locator: string) => void
}) => {
    const [isHovering, setIsHovering] = useState(false)
    const _timeoutRef = useRef<ReturnType<typeof setTimeout>>()
    const _hoveredTimeoutRef = useRef<ReturnType<typeof setTimeout>>()

    const _mouseMovePositionCollectionRef = useRef<Array<IPosition>>([])
    const _previousEventPositionRef = useRef<Map<string, number>>(new Map())
    const _currentHoveredItemRef = useRef<string>('')

    const handleMouseEnter = (event: MouseEvent, menuItem: IMenuItem) => {
        if (isMouseHoverWithinElement(event, _aimedTargetRef)) {
            clearTimeout(_hoveredTimeoutRef.current)
            clearTimeout(_timeoutRef.current)
            return
        }
        const isAnAimedMovement = isPointsInsideMovementArea(
            _mouseHoverAreaRef.current as HTMLUListElement,
            _mouseMovePositionCollectionRef.current,
        ) as boolean
        _currentHoveredItemRef.current = menuItem?.locator
        if (_timeoutRef.current && isAnAimedMovement) {
            return
        }

        clearTimeout(_timeoutRef.current)
        const { locator } = menuItem
        setIsHovering(true)
        setMouseTimeout(isAnAimedMovement, locator)
    }

    const handleMouseOut: MouseEventHandler = event => {
        if (isMouseHoverWithinElement(event, _aimedTargetRef)) {
            clearTimeout(_hoveredTimeoutRef.current)
            clearTimeout(_timeoutRef.current)
            return
        }
        if (_mouseHoverAreaRef?.current === event.relatedTarget) {
            return false
        }
        setIsHovering(false)
        _callback('')
        clearTimeout(_timeoutRef.current)
        clearCollectionRef(_mouseMovePositionCollectionRef)
    }

  
    const handleMouseMove: MouseEventHandler = event => {
        if (isMouseHoverWithinElement(event, _aimedTargetRef)) {
            clearTimeout(_hoveredTimeoutRef.current)
            return
        }

        const { positionX, positionY } = getNativeMousePosition(event)
        const previousPositionX = _previousEventPositionRef.current.get('positionX')
        const previousPositionY = _previousEventPositionRef.current.get('positionY')

        if (previousPositionX === positionX || positionY === previousPositionY) {
            return
        }
        _previousEventPositionRef.current.set('positionX', positionX)
        _previousEventPositionRef.current.set('positionX', positionY)

        _mouseMovePositionCollectionRef?.current?.push({ positionX, positionY })
        const mousePositionList = _mouseMovePositionCollectionRef?.current
        if (mousePositionList?.length > 3) {
            _mouseMovePositionCollectionRef?.current?.splice(0, 1)
        }

        clearTimeout(_hoveredTimeoutRef.current)
        _hoveredTimeoutRef.current = setTimeout(() => {
            _callback(_currentHoveredItemRef.current)
        }, IDLE_STATE_DELAY)
    }

    const setMouseTimeout = (isAnAimedMovement: boolean, locator: string) => {
        if (isAnAimedMovement) {
            _timeoutRef.current = setTimeout(() => {
                _callback(locator)
            }, MAX_DELAY)
        } else {
            clearTimeout(_timeoutRef.current)
            _callback(locator)
        }
    }

    return {
        handleMouseEnter,
        handleMouseOut,
        handleMouseMove,
        isHovering,
    }
}
