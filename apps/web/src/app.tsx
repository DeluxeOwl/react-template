
import { sum } from "@react-template/math"

import { cn } from "~/ui/lib/utils"

function binarySearch<T, K extends keyof T>(
    list: T[],
    target: T[K],
    key: K,
): number {
    let left = 0
    let right = list.length - 1

    while (left <= right) {
        const mid = Math.floor((left + right) / 2)
        const midValue = list[mid][key]

        if (midValue === target) {
            return mid
        }
        if (midValue < target) {
            left = mid + 1
        } else {
            right = mid - 1
        }
    }

    return -1
}

function fooSearch<T, K extends keyof T>(
    list: T[],
    target: T[K],
    key: K,
): number {
    let left = 0
    let right = list.length - 1

    while (left <= right) {
        const mid = Math.floor((left + right) / 2)
        const midValue = list[mid][key]

        if (midValue === target) {
            return mid
        }
        if (midValue < target) {
            left = mid + 1
        } else {
            right = mid - 1
        }
    }

    return -1
}

function App(): React.ReactNode {
    const a = 10
    const b = 12

    return (
        <div className={cn("mx-2")}>Hello world {sum(a, b)}
        </div>
    )
}

export default App
