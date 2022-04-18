import {Matrix} from "./Matrix.js";


// @ts-ignore
import dgram from "dgram";
import {gamma} from "./MatrixWLED.js";
import {MulticastSync} from "./MulticastSync.js";

const headerLength = 8;


export class MatrixLedstream extends Matrix {

    packets: Uint8ClampedArray[];
    socket: dgram.Socket;
    flipX: boolean;
    flipY: boolean;
    ip: string;
    port: number;

    chanHeight: number;
    channels: number;
    // frameNr:number;

    lastTime:number;

    syncer: MulticastSync;

    /**
     * Matrix driver for https://github.com/psy0rz/ledstream
     * We assume it has a Left/Right zigzag pattern, with multiple channels stacked vertically
     * @param scheduler
     * @param channels Number of channels (zigzag ledstrips)
     * @param width Physical width of matrix.
     * @param height Physical height of matrix. (divded over multiple channels)
     * @param ip IP address
     * @param port UDP port
     */
    constructor(scheduler, channels, width, height, ip, port = 21324) {
        super(scheduler, width, height);


        this.syncer=new MulticastSync('239.137.111.222', 65001, 1000)

        this.ip = ip;
        this.port = port;

        this.chanHeight = height / channels;
        this.channels=channels;

        this.packets = [];

        // this.frameNr=0;

        for (let c = 0; c < channels; c++) {
            this.packets.push(new Uint8ClampedArray(headerLength + (this.width * this.chanHeight * 3)));
        }


        this.socket = dgram.createSocket('udp4');
        this.socket.on('error', (err) => {
            console.log(`server error:\n${err.stack}`);
        });

    }

    //sets a pixel in the render buffer (called from Draw-classes render() functions)
    setPixel(x, y, color) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {

            const floorY = ~~y;
            const floorX = ~~x;

            const channel = ~~(floorY / this.chanHeight)
            const chanY = floorY % this.chanHeight;

            let offset;
            if (floorY & 1)
                offset = headerLength + (floorX * 3 + chanY * 3 * this.width);
            else
                offset = headerLength + ((this.width-floorX-1) * 3 + chanY * 3 * this.width);


            const old_a = 1 - color.a;

            this.packets[channel][offset] = (this.packets[channel][offset] * old_a + gamma[~~color.r] * color.a);
            this.packets[channel][offset + 1] = (this.packets[channel][offset + 1] * old_a + gamma[~~color.g] * color.a);
            this.packets[channel][offset + 2] = (this.packets[channel][offset + 2] * old_a + gamma[~~color.b] * color.a);

        }
    }


    frame() {
        setTimeout(() => this.frame(), 1000 / this.fpsControl.value)

        // console.log(Date.now()-this.lastTime);
        // this.lastTime=Date.now();


        // this.frameNr=(this.frameNr+1)%255;

        const now=Date.now();
        // console.log(now-this.lastTime);
        this.lastTime=now;


        for (let c = 0; c < this.channels; c++) {
            this.packets[c][3] = ((now  >> 24) & 0xff)
            this.packets[c][2] = ((now  >> 16) & 0xff)
            this.packets[c][1] = ((now  >> 8) & 0xff)
            this.packets[c][0] = (now & 0xff)
            this.packets[c][4]=c;
            // this.packets[c][5]=;//unused
            // this.packets[c][6]=;
            // this.packets[c][7]=;



            // if (random(0,100)>20)

            // @ts-ignore
            this.socket.send(this.packets[c]);
            //clear
            this.packets[c]=new Uint8ClampedArray(headerLength + (this.width * this.chanHeight * 3))
        }


        if (this.runScheduler) {

            this.scheduler.update();
        }

        this.render();

    }


    run() {
        this.socket.on('connect', () => {
            this.frame()

        })
        this.socket.connect(this.port, this.ip)

    }


}
