import { removeChildren } from "./utils"

export class SpanGrid {
    private spans: HTMLSpanElement[][]

    constructor(
        public width: number,
        public height: number,
        private container: HTMLElement,

        deleteChildren: boolean = false
    ) {
        if (deleteChildren) {
            container.textContent = ''
            removeChildren(container)
        }


        this.spans = []

        for (let y = 0; y < height; y++) {
            const row = []

            for (let x = 0; x < width; x++) {
                const span = document.createElement('span')
                span.textContent = [':', ')', ' '][Math.floor(Math.random() * 2.9)]

                row.push(span)
                this.container.appendChild(span)
            }

            this.container.appendChild(document.createElement('br'))
            this.spans.push(row)
        }
    }

    getSpan(x: number, y: number) {
        if (x < 0
            || x >= this.width
            || y < 0
            || y >= this.height
        ) {
            console.error({ x, y, width: this.width, height: this.height })
            // throw new Error()
            return undefined
        }

        return this.spans[y][x]
    }
}