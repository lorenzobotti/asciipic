export function applyEdgeDetection(
    data: Uint8ClampedArray,
    width: number,
    height: number,
) {
    // Convert to grayscale
    const grayData = new Uint8ClampedArray(width * height);
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        grayData[i/4] = 0.299 * r + 0.587 * g + 0.114 * b;
    }

    // Sobel operators
    const sobelX = [
        -1, 0, 1,
        -2, 0, 2,
        -1, 0, 1
    ];
    
    const sobelY = [
        -1, -2, -1,
         0,  0,  0,
         1,  2,  1
    ];

    // Apply Sobel operator
    const output = new Uint8ClampedArray(width * height);
    const threshold = 128; // Adjust this value for sensitivity

    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            let gx = 0;
            let gy = 0;
            
            for (let ky = -1; ky <= 1; ky++) {
                for (let kx = -1; kx <= 1; kx++) {
                    const idx = (y + ky) * width + (x + kx);
                    const weightX = sobelX[(ky + 1) * 3 + (kx + 1)];
                    const weightY = sobelY[(ky + 1) * 3 + (kx + 1)];
                    
                    gx += grayData[idx] * weightX;
                    gy += grayData[idx] * weightY;
                }
            }
            
            const magnitude = Math.sqrt(gx * gx + gy * gy);
            output[y * width + x] = magnitude > threshold ? 255 : 0;
        }
    }

    // Convert back to RGBA
    for (let i = 0; i < output.length; i++) {
        const val = output[i];
        data[i * 4] = 255 - val;     // R
        data[i * 4 + 1] = 255 - val; // G
        data[i * 4 + 2] = 255 - val; // B
        data[i * 4 + 3] = 255; // A
    }

    return output    
}