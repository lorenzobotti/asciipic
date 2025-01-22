import { SpanGrid } from "./span_grid"
import { map } from "./utils"

export const chars = {
    minimalist: "#+-.",
    normal: "@%#*+=-:.",
    normal2: "&$Xx+;:.",
    alphabetic: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    alphanumeric: "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmnopqrstuvwxyz",
    numerical: "0896452317",
    extended: "@%#{}[]()<>^*+=~-:.",
    math: "+-\xd7\xf7=≠≈∞√π",
    arrow: "↑↗→↘↓↙←↖",
    grayscale: "@$BWM#*oahkbdpwmZO0QCJYXzcvnxrjft/|()1{}[]-_+~<>i!lI;:,\"^`'.",
    max: "\xc6\xd1\xcaŒ\xd8M\xc9\xcb\xc8\xc3\xc2WQB\xc5\xe6#N\xc1\xfeE\xc4\xc0HKRŽœXg\xd0\xeaq\xdbŠ\xd5\xd4A€\xdfpm\xe3\xe2G\xb6\xf8\xf0\xe98\xda\xdc$\xebd\xd9\xfd\xe8\xd3\xde\xd6\xe5\xff\xd2b\xa5FD\xf1\xe1ZP\xe4š\xc7\xe0h\xfb\xa7\xddkŸ\xaeS9žUTe6\xb5Oyx\xce\xbef4\xf55\xf4\xfa&a\xfc™2\xf9\xe7w\xa9Y\xa30V\xcdL\xb13\xcf\xcc\xf3C@n\xf6\xf2s\xa2u‰\xbd\xbc‡zJƒ%\xa4Itoc\xeerjv1l\xed=\xef\xec<>i7†[\xbf?\xd7}*{+()/\xbb\xab•\xac|!\xa1\xf7\xa6\xaf—^\xaa„”“~\xb3\xba\xb2–\xb0\xad\xb9‹›;:’‘‚’˜ˆ\xb8…\xb7\xa8\xb4`",
    codepage437: "█▓▒░",
    blockelement: "█",
    GIOBOTTI_grayscale: "@$BWM#*oahkbdpwmZO0QCJYXzcvnxrjft/|()1{}[]-_+~<>i!lI;:,\"^`'.             ",
}

// const dots = chars.GIOBOTTI_grayscale.split('').reverse().join()
const dots = chars.GIOBOTTI_grayscale
// const dots = `§&%$gexocljsvtr`

const MAX_BRIGHTNESS = getBrightness(255, 255, 255)

export const ASPECT_1_2 = 0.5
export const ASPECT_3_5 = 0.6

export function getAsciiWidth(
    asciiHeight: number,
    videoRatio: number,
    charAspectRatio: number,
) {
    const asciiWidth = Math.floor(asciiHeight * videoRatio / charAspectRatio)
    return asciiWidth
}

export function canvasToAscii(
    canvas: HTMLCanvasElement,
    asciiWidth: number,
    asciiHeight: number,
    spanGrid?: SpanGrid,
    options?: {
        color?: boolean,
        reverse?: boolean,
        dict?: string
    },
) {
    let result = ''

    const ctx = canvas.getContext('2d', {
        willReadFrequently: true,
    })

    if (!ctx) {
        throw new Error()
    }

    const pixelWidth = canvas.width / asciiWidth
    const pixelHeight = canvas.height / asciiHeight
    const dict = options?.dict ?? dots

    for (let y = 0; y < asciiHeight; y++) {
        for (let x = 0; x < asciiWidth; x++) {
            const imageData = ctx.getImageData(
                Math.floor(x * pixelWidth),
                Math.floor(y * pixelHeight),
                Math.floor(pixelWidth),
                Math.floor(pixelHeight),
            )

            const avgColor = averageColorRect(imageData)
            
            let { r, g, b } = avgColor
            if (options?.reverse) {
                r = 255 - r
                g = 255 - g
                b = 255 - b
            }
            
            const brightness = getBrightness(r, g, b)
            const charI = Math.floor(map(brightness, 0, MAX_BRIGHTNESS, 0, dots.length))

            const char = dict[charI]

            if (spanGrid) {
                const span = spanGrid.getSpan(x, y)
                if (!span) {
                    continue
                }

                if (options?.color) {
                    span.style.color = `rgb(${r}, ${g}, ${b})`
                }
                span.textContent = char
            }

            result += char
        }

        result += '\n'
    }

    return result
}

export function averageColorRect(
    rect: ImageData,
) {
    const data = rect.data
    let r = 0, g = 0, b = 0;

    // Loop through each pixel
    for (let i = 0; i < data.length; i += 4) {
        r += data[i];     // Red
        g += data[i + 1]; // Green
        b += data[i + 2]; // Blue
    }

    // Calculate the average
    const pixelCount = data.length / 4;
    r = Math.round(r / pixelCount);
    g = Math.round(g / pixelCount);
    b = Math.round(b / pixelCount);

    if (
        r > 255
        || g > 255
        || b > 255
    ) {
        throw new Error()
    }

    return { r, g, b }; // Return the average color as an object
}

export function getBrightness(r: number, g: number, b: number) {
    return Math.round(0.299 * r + 0.587 * g + 0.114 * b);
}