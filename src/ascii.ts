import { applyEdgeDetection } from "./edge_detection"
import { CharGrid, SpanGrid } from "./span_grid"
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

const MAX_BRIGHTNESS = () => getBrightness(255, 255, 255)

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
    options?: ImageDataToAsciiOptions,
) {
    const ctx = canvas.getContext('2d')
    if (!ctx) {
        throw new Error()
    }

    const image = ctx.getImageData(0, 0, canvas.width, canvas.height)

    return imageDataToAscii(image, asciiWidth, asciiHeight, spanGrid, options)
}

export interface ImageDataToAsciiOptions {
    color?: boolean,
    reverse?: boolean,
    edgeDetection?: boolean,
    dict?: string
}

export function imageDataToAscii(
    image: ImageData,
    asciiWidth: number,
    asciiHeight: number,
    spanGrid?: CharGrid,
    options?: ImageDataToAsciiOptions,
) {
    let result = ''

    const pixelWidth = image.width / asciiWidth
    const pixelHeight = image.height / asciiHeight
    const dict = (options?.dict ?? dots).split('')

    // const wholeImageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    let edgesData: ImageData | undefined = undefined

    if (options?.edgeDetection) {
        edgesData = cloneImageData(image)
        applyEdgeDetection(edgesData.data, edgesData.width, edgesData.height)
    }


    for (let y = 0; y < asciiHeight; y++) {
        for (let x = 0; x < asciiWidth; x++) {
            const sourceImage = edgesData ?? image

            const avgColor = averageColorRectBounded(
                sourceImage.data,
                sourceImage.width,
                sourceImage.height,
                Math.floor(x * pixelWidth),
                Math.floor(y * pixelHeight),
                Math.floor(pixelWidth),
                Math.floor(pixelHeight),
            )

            let { r, g, b, a } = avgColor
            if (options?.reverse) {
                r = 255 - r
                g = 255 - g
                b = 255 - b
            }

            const brightness = getBrightness(r, g, b, a)

            let charI = Math.floor(map(brightness, 0, MAX_BRIGHTNESS(), 0, dict.length))

            if (charI >= dict.length) {
                charI = dict.length - 1
            }

            const char = dict[charI]

            if (spanGrid) {
                spanGrid.setText(x, y, char)
                if (options?.color) {
                    spanGrid.setColor(x, y, { r, g, b })
                }
            }

            result += char
        }

        result += '\n'
    }

    return result
}

function cloneImageData(i: ImageData) {
    return new ImageData(
        new Uint8ClampedArray(i.data),
        i.width,
        i.height
    )
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


const COLOR_BYTES = 4
const MAX_COLOR = 255

export function averageColorRectBounded(
    data: Uint8ClampedArray,

    imageWidth: number,
    _imageHeight: number,

    left: number,
    top: number,
    width: number,
    height: number,
) {
    let r = 0, g = 0, b = 0, a = 0;
    let count = 0;

    for (let x = left; x < (left + width); x++) {
        for (let y = top; y > (top - height); y--) {
            const i = imageCoord(x, y, imageWidth);

            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
            a += data[i + 2];

            count += 1
        }
    }

    if (a < 200) {
        return { r: 255, g: 255, b: 255 }
    }

    const pixelCount = count;
    r = Math.round(r / pixelCount);
    g = Math.round(g / pixelCount);
    b = Math.round(b / pixelCount);
    a = Math.round(a / pixelCount);

    if (
        r > MAX_COLOR
        || g > MAX_COLOR
        || b > MAX_COLOR
        || a > MAX_COLOR
    ) {
        throw new Error()
    }

    return { r, g, b, a };
}

export function imageCoord(x: number, y: number, imageWidth: number,) {
    return (y * imageWidth + x) * COLOR_BYTES
}

export function getBrightness(r: number, g: number, b: number, a?: number): number {
    const brightness = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    return brightness

    // TODO: transparency
    // if (a === undefined || a < 50) {
    //     return brightness
    // } else {
    //     return MAX_BRIGHTNESS()
    // }
}