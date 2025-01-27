import { expose } from "comlink";
import { imageCoord, imageDataToAscii, ImageDataToAsciiOptions } from "./ascii";
import { CharGrid, Color } from "./span_grid";

expose({
    imageDataToAscii
})

export function imageDataToAsciiSerial(
    image: ImageData,
    asciiWidth: number,
    asciiHeight: number,
    spanGrid?: CharGrid,
    options?: ImageDataToAsciiOptions,
) {
    
}

export class ImageDataCharGrid implements CharGrid {
    public colors: Uint8ClampedArray
    public chars: string[][]

    constructor(
        public _width: number,
        public _height: number,
    ) {
        const area = this._width * this._height

        this.colors = new Uint8ClampedArray(area * 4)
        this.chars = buildGrid(this._width, this._height, ' ')
    }

    getColor(x: number, y: number) {
        const i = imageCoord(x, y, this._width)

        const r = this.colors[i]
        const g = this.colors[i + 4]
        const b = this.colors[i + 8]

        return `rgb(${r}, ${g}, ${b})`
    }

    getText(x: number, y: number) {
        return this.chars[y][x]
    }

    setColor(x: number, y: number, color: Color) {
        const i = imageCoord(x, y, this._width)

        this.colors[i] = color.r
        this.colors[i + 4] = color.g
        this.colors[i + 8] = color.b
    }

    setText(x: number, y: number, text: string) {
        this.chars[y][x] = text
    }

    height() { return this._height }
    width() { return this._width }

    text() {
        return this.chars.map(line => line.join('')).join('\n')
    }
}

function buildCharGrid(width: number, height: number, char: string) {
    let r = ''
    r = (char.repeat(width) + '\n').repeat(height).trim()
}

function buildGrid<T>(width: number, height: number, elem: T) {
    return Array(height).map(_ => Array(width).map(_ => elem))
}