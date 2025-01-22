export function map(
    value: number,
    start1: number,
    stop1: number,
    start2: number,
    stop2: number,
    withinBounds: boolean = false
): number {
    const mappedValue =
        ((value - start1) * (stop2 - start2)) / (stop1 - start1) + start2;

    if (withinBounds) {
        if (start2 < stop2) {
            return Math.min(Math.max(mappedValue, start2), stop2);
        } else {
            return Math.min(Math.max(mappedValue, stop2), start2);
        }
    }

    return mappedValue;
}


export function removeChildren(element: HTMLElement) {
    for (const child of element.children) {
        element.removeChild(child)
    }
}