import { IAreaCoordinates, ICoordinate, IPosition } from '../types/menu.types.ts'
import { MouseEvent, MutableRefObject, RefObject } from 'react'

export const getNativeMousePosition = (event: MouseEvent) => {
    const { pageX, pageY, clientX, clientY } = event.nativeEvent
    const isWithinPageScrollableArea = pageX || pageY //menu height and width is static
    if (isWithinPageScrollableArea) {
        return {
            positionX: pageX,
            positionY: pageY,
        }
    } else if (clientX || clientY) {
        return {
            positionX: clientX,
            positionY: clientY,
        }
    }
    return {
        positionX: 0,
        positionY: 0,
    }
}

export const isMouseHoverWithinElement = (event: MouseEvent, ref: RefObject<HTMLDivElement>) => {
    const currentTarget = event.currentTarget as HTMLElement
    const targetWidth = currentTarget.offsetWidth as number
    if (!ref.current) {
        return false
    }
    const eleBounds = ref.current.getBoundingClientRect()
    return (event.clientX >= targetWidth || event.clientX >= eleBounds?.left) && event.clientX <= eleBounds.right
}

export const clearCollectionRef = (ref: MutableRefObject<Array<IPosition>>) => {
    ref.current = []
}

export const getRailScreenPosition = (element: HTMLElement) => {
    const { left, top, height, width } = element.getBoundingClientRect()
    return {
        topRightPosition: {
            positionX: left + width,
            positionY: top,
        },
        bottomRightPosition: {
            positionX: left + width,
            positionY: top + height,
        },
    }
}

export const isPointsInsideMovementArea = (container: HTMLUListElement, mousePositions: Array<IPosition>) => {
    if (mousePositions?.length < 3) {
        return
    }
    //get left rail coordinates for top right and bottom right.
    const { topRightPosition, bottomRightPosition } = getRailScreenPosition(container)
    const positionToCheck = mousePositions[mousePositions.length - 1]
    const triangleStartPosition = mousePositions[0]

    const trianglePointA = {
        x1: topRightPosition.positionX,
        y1: topRightPosition.positionY,
    }

    const trianglePointB = {
        x2: bottomRightPosition.positionX,
        y2: bottomRightPosition.positionY,
    }

    const trianglePointC = {
        x3: triangleStartPosition.positionX,
        y3: triangleStartPosition.positionY,
    }

    const triangleCoordinates = {
        ...trianglePointA,
        ...trianglePointB,
        ...trianglePointC,
    }

    const positionToCheckCoordinates = {
        x: positionToCheck.positionX,
        y: positionToCheck.positionY,
    }
    return isInside(triangleCoordinates, positionToCheckCoordinates)
}

export const area = ({ x1, y1, x2, y2, x3, y3 }: IAreaCoordinates) => {
    return Math.abs((x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2)) / 2.0)
}

export const isInside = (triangleCoordinates: IAreaCoordinates, positionToCheck: ICoordinate) => {
    const { x1, y1, x2, y2, x3, y3 } = triangleCoordinates

    const { x, y } = positionToCheck
    const entireTriangleArea = area({ x1, y1, x2, y2, x3, y3 })
    const subArea1 = area({ x1: x, y1: y, x2, y2, x3, y3 })
    const subArea2 = area({ x1, y1, x2: x, y2: y, x3, y3 })
    const subArea3 = area({ x1, y1, x2, y2, x3: x, y3: y })

    return entireTriangleArea === subArea1 + subArea2 + subArea3
}
