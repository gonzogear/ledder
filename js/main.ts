import {MatrixCanvas} from "./MatrixCanvas.js";
import {AnimationTest} from "./AnimationTest.js";
import {Scheduler} from "./Scheduler.js";

let scheduler = new Scheduler();


let matrix = new MatrixCanvas(scheduler, 37, 8, '#matrix', 5, 16);

scheduler.interval(60, () => {
  scheduler.status();
  matrix.status();
});

// new AnimationTest(matrix);
matrix.run();


import {JSONRPC, JSONRPCResponse, JSONRPCServer, JSONRPCServerAndClient, JSONRPCClient} from "json-rpc-2.0";

let ws_url;
if (location.protocol === 'http:')
  ws_url = "ws://" + location.host + "/ws";
else
  ws_url = "wss://" + location.host + "/ws";

const webSocket = new WebSocket(ws_url);

const serverAndClient = new JSONRPCServerAndClient(
  new JSONRPCServer(),
  new JSONRPCClient((request) => {
    try {
      webSocket.send(JSON.stringify(request));
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  })
);

webSocket.onmessage = (event) => {
  serverAndClient.receiveAndSend(JSON.parse(event.data.toString()));
};

// On close, make sure to reject all the pending requests to prevent hanging.
webSocket.onclose = (event) => {
  serverAndClient.rejectAllPendingRequests(
    `Connection is closed (${event.reason}).`
  );
};

serverAndClient.addMethod("echo", (text) => {
  console.log("echo", text);

});

webSocket.onopen = () => {
  serverAndClient
    .request("run", {name: "AnimationTest"})
    .then((result) => console.log("jo",result), (e)=>{ console.log("kk")});
};