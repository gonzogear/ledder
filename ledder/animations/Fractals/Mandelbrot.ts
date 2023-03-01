import PixelBox from "../../PixelBox.js"
import {colorBlack} from "../../Colors.js"
import {glow, randomFloatGaussian, randomGaussian} from "../../utils.js"
import Scheduler from "../../Scheduler.js"
import {patternSelect} from "../../ColorPatterns.js"
import {rainbow} from "../../ColorPatterns.js"
import ControlGroup from "../../ControlGroup.js"
import Pixel from "../../Pixel.js"
import Color from "../../Color.js";
import Animator from "../../Animator.js"
import {inspect} from "util"
const MAX_ITERATION = 2000


export default class <Mandelbrot> extends Animator {
    static category = "Fractals"
    static title = "Mandelbrot"
    static description = "Base on the 1993 Firedemo"
    max_iterations=20
   

    mandelbrot(c) {
        let z = { x: 0, y: 0 }, n=20, p, d;
        do {
            p = {
                x: Math.pow(z.x, 2) - Math.pow(z.y, 2),
                y: 2 * z.x * z.y
            };
            z = {
                x: p.x + c.x,
                y: p.y + c.y
            };
            d = Math.sqrt(Math.pow(z.x, 2) + Math.pow(z.y, 2));
            n += 1;
        } while (d <= 2 && n < this.max_iterations);
        return [n, d <= 2];
    }

   

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {

        const fractalColorCycle = controls.switch("Palette Cycle", false, true);
        const fractalZoom = controls.switch("Zoomer", true, true);
        //const fractalRealRange = controls.range("REAL", -2,1, -2,1,0.1)   //unused.. fixed for now
        //const fractalImaginaryRange = controls.range("IMAGINARY", -1, 1, -1, 1,0.1)  //unused..fixed for now
        const fractalIterations = controls.value("Fractal iterations", 128, 1, 1000, 1)
       
        const colors = patternSelect(controls, 'Color Palette', 'Brainsmoke fire')
        const fractalintervalControl = controls.value("Fractal interval", 1, 1, 10, 0.1)
        let x=0;
        let cx=0;
        let q=0; //palettecycle var
        box.clear();

        scheduler.intervalControlled(fractalintervalControl, (frameNr) => {
           
            let REAL_SET = { start: -2, end: 1 }
            let IMAGINARY_SET = { start: -1, end: 1 }
            const y=0; 
            let zoom=0
            let pc=0
            let iterations=0; 
            q=q+1

            //read settings
            this.max_iterations=fractalIterations.value     
            if (fractalColorCycle.enabled){ pc=q }
            if (fractalZoom.enabled)
            {
                REAL_SET = { start: -2+Math.sin(q/100)+0, end: 1-Math.cos(q/100)-0 }
                IMAGINARY_SET = { start: -1+Math.sin(q/100)+0, end: 1-Math.cos(q/100)-0 }
            }
           
            //calculate all visible pixel positions
            //box.clear();
            for (let i = 0; i < box.width(); i++) {
                for (let j = 0; j < box.height(); j++) {
                    let complex = {
                        x: REAL_SET.start + (i / box.width()) * (REAL_SET.end - REAL_SET.start),
                        y: IMAGINARY_SET.start + (j / box.height()) * (IMAGINARY_SET.end - IMAGINARY_SET.start)
                    }
                    const [m, isMandelbrotSet] = this.mandelbrot(complex);
                    if (m!=false)
                    {
                        let color= colors[Math.round((+m+pc) % (colors.length-1))];
                        let pixel = new Pixel(i,j,color);
                        box.add(pixel);
                    }
                    else
                    {
                        let pixel = new Pixel(i,j,new Color(123,13,255,1));
                        box.add(pixel);
                    }
                }
            }
        })
    }
}
