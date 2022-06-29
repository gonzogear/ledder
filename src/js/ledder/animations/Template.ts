import {Animation} from "../Animation.js";
import {Matrix} from "../Matrix.js";
import {Scheduler} from "../Scheduler.js";
import {ControlGroup} from "../ControlGroup.js";
import {Pixel} from "../Pixel.js";
import {Color} from "../Color.js";
import {PixelContainer} from "../PixelContainer.js";

export default class Template extends  Animation
{
    static category = "Test"
    static title = "Template for new animations"
    static description = "blabla"
    static presetDir = "Test";

    async run(matrix: Matrix, scheduler: Scheduler, controls: ControlGroup) {

        const pixel=new Pixel(0,0, new Color(255,0,0))
        matrix.add(pixel)

    }
}