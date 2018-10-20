import * as bodyParser from "body-parser"
import * as express from "express"
import { handleCall } from "./api"
import { ICallEventNotification, CallAction } from "./types"
import { createServer } from "http"
import { Server as WebSocketServer } from "ws"
import * as WebSocket from "ws"
import { parse } from "url"
import { Server } from "http"
import { textToMp3, mp3ToWav } from "./tongue"
import { IWebSocketPackage } from "./types"

export default class {
  private httpServer: Server
  private webSocketServer: WebSocketServer
  private subscriberSocketsMap = new Map<string, Set<WebSocket>>()

  constructor(
    private port = 80
  ) {
    // Configure Express App
    const app = express()
    app.use(bodyParser.json())

    // Host HTTP and WS Servers
    const server = createServer(app)
    this.webSocketServer = new WebSocketServer({ server })
    this.httpServer = server

    // Attach WS Event Handlers
    this.webSocketServer.on("connection", (socket, req) => {
      console.log(`Established WebSocket Channel with: ${req.connection.remoteAddress}`)

      const onError = (...args: {}[]) => {
        console.log(...["## Socket", ...args])
        socket.removeAllListeners()
        socket.close()
      }
      socket.on("close", (code, reason) => onError("Hangup:", code, reason))
      socket.on("error", err => onError("Error: Client Error:", err))

      // Handle Messages sent by Client
      socket.on("message", async data => {
        console.log(`Received Client Data: ${data}`)

        // #TODO convert text into polly mp3
        const mp3File = await textToMp3(data.toString())
        console.log(mp3File)

        // #TODO convert mp3 to wav
        const wavFile = await mp3ToWav(mp3File)
        console.log(wavFile)

        // #TODO play wav into chat
      })

      // Parse QueryString to retrieve impuAddress passed by client (by convention)
      const { url } = req
      if (url === undefined) {
        return onError("Error: Querystring empty")
      }
      const { impuAddress } = parse(url, true).query
      if (impuAddress === undefined || typeof impuAddress !== "string") {
        return onError("Error: impuAddress not set properly in queryString")
      }

      // Check if other people are also subscribing to that phone number's events
      const { subscriberSocketsMap } = this
      console.log(`Subscribing Client to map: ${subscriberSocketsMap.size} using impuAddress: ${impuAddress}`)
      const subscriberSockets = subscriberSocketsMap.get(impuAddress)
      if (subscriberSockets) {
        subscriberSockets.add(socket)
      } else {
        subscriberSocketsMap.set(impuAddress, new Set([socket]))
      }
      console.log(`Subscribed Client to map: ${subscriberSocketsMap.size}`)
    })

    // Configure Routes
    app.post("/", async (req, res) => {
      const body = req.body
      const callEventNotification = body.callEventNotification as ICallEventNotification
      const { calledParticipant, callingParticipant } = callEventNotification
      console.log(`Received Server Callback:\n  Caller: ${callingParticipant}\n  Called: ${calledParticipant}`)

      // Answer the Nokia API and tell it to continue the call
      console.log(`  Continuing phone Call..`)
      res.json(handleCall(calledParticipant, CallAction.Continue))

      // Notify our subscribers for that impuAddress of the event
      const subscriberSockets = this.subscriberSocketsMap.get(calledParticipant)
      console.log(`  Notifying Subscribers, found: ${subscriberSockets && subscriberSockets.size} for impuAddress: ${calledParticipant}`)
      if (!subscriberSockets) return
      for (const subscriberSocket of subscriberSockets) {
        const message: IWebSocketPackage = { ...callEventNotification.eventDescription }
        subscriberSocket.send(JSON.stringify(message))
      }
    })
  }

  public run() {
    this.httpServer.listen(this.port)
    console.log(`Server running on port: ${this.port}`)
  }
}
