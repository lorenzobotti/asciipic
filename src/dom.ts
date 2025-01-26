import { ASPECT_3_5, canvasToAscii, chars, getAsciiWidth } from "./ascii"
import { applyEdgeDetection } from "./edge_detection"
import { SpanGrid } from "./span_grid"
import { VideoAnimation } from "./video"

export const form = document.getElementById('form') as HTMLFormElement
export const files = document.getElementById('files') as HTMLInputElement
export const hidden = document.getElementById('hidden') as HTMLDivElement
export const canvas = document.getElementById('canvas') as HTMLCanvasElement
// export const textExport = document.getElementById('text-export') as HTMLPreElement
export const colorExport = document.getElementById('color-export') as HTMLPreElement

export const inputHeight = document.getElementById('input-height') as HTMLInputElement
export const inputDarkmode = document.getElementById('input-darkmode') as HTMLInputElement
export const inputBold = document.getElementById('input-bold') as HTMLInputElement
export const inputColor = document.getElementById('input-color') as HTMLInputElement
export const inputEdge = document.getElementById('input-edge') as HTMLInputElement
export const inputFontSize = document.getElementById('input-font-size') as HTMLInputElement

export const asciiCustom = document.getElementById('ascii-custom') as HTMLInputElement
export const asciiDict = document.getElementById('ascii-dict') as HTMLSelectElement

export async function init() {
    await form.addEventListener('submit', submit)
}

interface FormInput {
    bold: boolean,
    darkMode: boolean,
    color: boolean,
    edgeDetection: boolean,
    asciiHeight: number,
    asciiDict: string,
}

function readForm(): FormInput {
    const r = {
        asciiHeight: parseInt(inputHeight.value),
        darkMode: inputDarkmode.checked,
        bold: inputBold.checked,
        color: inputColor.checked,
        edgeDetection: inputEdge.checked,
        asciiDict: asciiCustom.value,
    }

    console.log(r)

    return r
}

inputDarkmode.addEventListener('change', () => {
    const v = inputDarkmode.checked

    if (v) {
        document.body.classList.remove('light')
        document.body.classList.add('dark')
    } else {
        document.body.classList.add('light')
        document.body.classList.remove('dark')
    }
})

addSelectionToCustom()
asciiDict.addEventListener('change', addSelectionToCustom)

function addSelectionToCustom() {
    const dict = (chars as any)[asciiDict.value] as string | undefined
    if (!dict) {
        return
    }

    asciiCustom.disabled = false
    asciiCustom.value = dict
}

inputFontSize.addEventListener('input', updateFontSize)
inputFontSize.addEventListener('change', updateFontSize)
function updateFontSize() {
    const size = parseInt(inputFontSize.value) / 10
    colorExport.style.fontSize = `${size}rem`
}

export async function submit(event: SubmitEvent) {
    event.preventDefault();

    const options = readForm()
    colorExport.style.fontWeight = options.bold ? 'bold' : 'normal'

    const file = files.files?.item(0) ?? undefined;
    if (!file) {
        return;
    }

    let media: HTMLImageElement | HTMLVideoElement
    let typ: 'image' | 'video'

    let width: number
    let height: number

    if (file.type.startsWith('image')) {
        typ = 'image'
        const imageUrl = URL.createObjectURL(file);

        const image = document.createElement('img')
        image.src = imageUrl

        removeAllChildren(hidden)
        hidden.appendChild(image)

        const loaded = new Promise<void>((resolve, reject) => {
            image.onload = () => resolve()
            image.onerror = err => reject(err)
        })

        await loaded

        width = image.width
        height = image.height

        media = image
    } else if (file.type.startsWith('video')) {
        typ = 'video'
        const videoUrl = URL.createObjectURL(file);

        const video = document.createElement('video')
        video.loop = true
        video.muted = true
        video.src = videoUrl

        removeAllChildren(hidden)
        hidden.appendChild(video)

        const loaded = new Promise<void>((resolve, reject) => {
            video.onloadeddata = () => resolve()
            video.onerror = err => reject(err)
        })

        await loaded

        width = video.videoWidth
        height = video.videoHeight

        media = video
    } else {
        throw new Error()
    }

    const aspectRatio = width / height

    const scaledWidth = 400
    const scaledHeight = 400 / aspectRatio

    const asciiHeight = options.asciiHeight
    const asciiWidth = getAsciiWidth(asciiHeight, aspectRatio, ASPECT_3_5)

    canvas.width = scaledWidth
    canvas.height = scaledHeight

    const grid = new SpanGrid(asciiWidth, asciiHeight, colorExport, true)

    if (typ === 'image') {
        ctx().drawImage(media, 0, 0, canvas.width, canvas.height)

        canvasToAscii(canvas, asciiWidth, asciiHeight, grid, { color: true, dict: options.asciiDict })
        // textExport.textContent = str
    } else if (typ === 'video') {
        const a = new VideoAnimation(
            canvas,
            ctx(),
            media as HTMLVideoElement,
            asciiHeight,
            ASPECT_3_5,
            {
                textCallback: (_s) => {
                    // textExport.textContent = s
                    Date.now()
                },
                spanGrid: grid,
                color: options.color,
                dict: options.asciiDict
            }
        )

        a.startAnimation()
    }
}

function ctx() {
    const c = canvas.getContext('2d')
    if (!c) {
        throw new Error('ah!')
    }

    return c
}

function removeAllChildren(h: HTMLElement) {
    for (const c of h.children) {
        h.removeChild(c)
    }
}