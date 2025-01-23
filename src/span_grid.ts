import { removeChildren } from "./utils"


export interface CharGrid {
    width: () => number,
    height: () => number,

    setColor: (x: number, y: number, color: string) => void,
    setText: (x: number, y: number, text: string) => void,
}
export class SpanGrid {
    private spans: HTMLSpanElement[][]

    constructor(
        public _width: number,
        public _height: number,
        private container?: HTMLElement,

        deleteChildren: boolean = false
    ) {
        if (container && deleteChildren) {
            container.textContent = ''
            removeChildren(container)
        }

        this.spans = []

        for (let y = 0; y < _height; y++) {
            const row = []

            for (let x = 0; x < _width; x++) {
                const span = document.createElement('span')
                span.textContent = [':', ')', ' '][Math.floor(Math.random() * 2.9)]

                row.push(span)
                if (this.container) {
                    this.container.appendChild(span)
                }
            }

            if (this.container) {
                this.container.appendChild(document.createElement('br'))
            }
            this.spans.push(row)
        }
    }

    width() {
        return this._width
    }
    
    height() {
        return this._height
    }

    getSpan(x: number, y: number) {
        if (x < 0
            || x >= this._width
            || y < 0
            || y >= this._height
        ) {
            console.error({ x, y, width: this._width, height: this._height })
            // throw new Error()
            return undefined
        }

        return this.spans[y][x]
    }

    setColor(x: number, y: number, color: string) {
        const span = this.getSpan(x, y)
        if (!span) {
            return
        }
        
        span.style.color = color
    }
    
    setText(x: number, y: number, text: string) {
        const span = this.getSpan(x, y)
        if (!span) {
            return
        }
        
        span.textContent = color
    }
}

