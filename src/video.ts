import { canvasToAscii, getAsciiWidth } from "./ascii"
import { SpanGrid } from "./span_grid"

export class VideoAnimation {
    width: number
    height: number

    asciiWidth: number

    playing: boolean = false

    constructor(
        private canvas: HTMLCanvasElement,
        private context: CanvasRenderingContext2D,
        private video: HTMLVideoElement,

        private asciiHeight: number,
        private charAspectRatio: number,

        private options: {
            width?: number,
            height?: number,
            textCallback?: (s: string) => void,
            spanGrid?: SpanGrid,

            color?: boolean,
            dict?: string
        }
    ) {
        // this.video.load()
        this.video.play()

        this.width = this.options.width ?? this.canvas.width
        this.height = this.options.height ?? this.canvas.height

        const videoRatio = this.width / this.height
        // this.asciiWidth = Math.floor(this.asciiHeight * videoRatio / this.charAspectRatio)
        this.asciiWidth = getAsciiWidth(this.asciiHeight, videoRatio, this.charAspectRatio)
    }

    startAnimation() {
        if (this.playing) {
            return
        }

        this.video.play()
        this.playing = true
        renderLoop(this)
    }

    stopAnimation() {
        this.video.pause()
        this.playing = false
    }

    _frame() {
        const w = this.width
        const h = this.height

        this.context.drawImage(this.video, 0, 0, w, h)

        if (this.options.textCallback) {
            const s = canvasToAscii(this.canvas, this.asciiWidth, this.asciiHeight, this.options.spanGrid, { color: this.options.color, dict: this.options.dict })
            this.options.textCallback(s)
        }
    }
}

function renderLoop(a: VideoAnimation) {
    if (!a.playing) {
        return
    }

    a._frame()
    requestAnimationFrame(() => renderLoop(a))
}