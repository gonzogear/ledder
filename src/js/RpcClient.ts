import {JSONRPCClient, JSONRPCServer, JSONRPCServerAndClient} from "json-rpc-2.0";
import {Rpc} from "./Rpc.js";
import {RpcServer} from "./RpcServer.js";
import {error, progressDone, progressStart} from "./led/util.js";

/***
 * Browser-side rpc client that connect to server handles rpc calls to/from server.
 */
class RpcClient extends Rpc {

  serverAndClient: JSONRPCServerAndClient;
  openHandler: () => void;
  closeHandler: () => void;

  constructor() {
    super();
  }

  init(openHandler, closeHandler = undefined) {

    this.openHandler = openHandler;
    this.closeHandler = closeHandler;

    this.connect();
  }

  connect() {


    let ws_url;
    if (location.protocol === 'http:')
      ws_url = "ws://" + location.host + "/ws";
    else
      ws_url = "wss://" + location.host + "/ws";

    const webSocket = new WebSocket(ws_url);

    this.serverAndClient = new JSONRPCServerAndClient(
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
      this.serverAndClient.receiveAndSend(JSON.parse(event.data.toString()));
    };

    // On close, make sure to reject all the pending requests to prevent hanging.
    webSocket.onclose = (event) => {
      this.serverAndClient.rejectAllPendingRequests(
        `Connection is closed (${event.reason}).`
      );

      setTimeout(() => this.connect(), 1000);

      if (this.closeHandler !== undefined)
        this.closeHandler();

    };


    webSocket.onopen = () => {
      this.openHandler();
    };
  }

  addMethod(name, method) {
    this.serverAndClient.addMethod(name, method);
  }

  /**
   * Makes a request to the server. Also shows progress-indicator and shows execptions to the user. (slower)
   * @param name
   * @param params
   */
  async request(name, ...params) {

    try {
      progressStart()
      let result=await this.serverAndClient.request(name, params)
      // console.log(result)
      progressDone()
      return(result)
    } catch (e) {
      progressDone()
      error("RPC request failed", e)
      console.error("RPC error", name, params, e)
      throw(e)
    }
  }

  /**
   * Make a request to server, without any extra processing and exception handling (faster)
   * @param name
   * @param params
   */
  async requestRaw(name, ...params) {
      return(this.serverAndClient.request(name, params))
  }

  /** Send a notify, doesnt return anything. (fastest)
   *
   * @param name
   * @param params
   */
  async notify(name, ...params)
  {
    this.serverAndClient.notify(name, params)
  }

}

export let rpc=new RpcClient()
