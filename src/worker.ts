import { expose } from "comlink";
import { canvasToAscii, imageDataToAscii } from "./ascii";

expose({
    imageDataToAscii
})