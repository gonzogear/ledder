import Fx from "../Fx.js";
import {ControlValue} from "../ControlValue.js";
import {ControlGroup} from "../ControlGroup.js";
import {Color} from "../Color.js";
import {Scheduler} from "../Scheduler.js";
import {PixelContainer} from "../PixelContainer.js";

//Blink pixelcontainers by adding/removing them from the target (always starts with on, ends with off)
export default class FxBlink extends Fx {

    onDelay: ControlValue
    offDelay: ControlValue
    repeat: ControlValue

     constructor(scheduler: Scheduler, controls: ControlGroup, onDelay=60, offDelay=60, repeat=0) {
        super(scheduler, controls)

        this.onDelay = controls.value('Blink on delay', onDelay, 1, 120, 1)
        this.offDelay = controls.value('Blink off delay', offDelay, 1, 120, 1)
        this.repeat = controls.value('Blink repeat', repeat, 0, 120, 1)
    }

    run(source: PixelContainer, target:PixelContainer) {

        this.running = true

        let on=false
        let count=this.offDelay.value
        let repeated=0

        this.promise = this.scheduler.interval(1, (frameNr) => {
            if (on)
            {
                if (count>=this.onDelay.value) {
                    on = false
                    count=0
                    for (const c of colors)
                        c.a = 0
                    repeated=repeated+1
                }
            }
            else
            {
                if (count>=this.offDelay.value) {
                    on = true
                    count=0
                    for (const c of colors)
                        c.a = 1
                }
            }

            count=count+1
            return ( (this.repeat.value==0 || repeated<this.repeat.value) && this.running)
        })


        return (this.promise)
    }
}
